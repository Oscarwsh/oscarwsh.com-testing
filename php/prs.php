<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$wcaId = '2025CEDE03';
$apiBase = 'https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/refs/heads/v1';

function fetchWcaJson(string $url): array
{
	$curl = curl_init($url);
	curl_setopt_array($curl, [
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_TIMEOUT => 10,
		CURLOPT_USERAGENT => 'Oscarwsh.com personal records',
	]);

	$response = curl_exec($curl);
	$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
	curl_close($curl);

	if ($response === false || $status < 200 || $status >= 300) {
		throw new RuntimeException('The WCA API request failed.');
	}

	$data = json_decode($response, true, 512, JSON_THROW_ON_ERROR);
	return is_array($data) ? $data : [];
}

function formatResult(?int $value, string|int $eventId): string
{
	if ($value === null || $value <= 0) {
		return 'N/A';
	}

	if ($eventId === '333fm') {
		return (string) $value;
	}

	if ($value >= 6000) {
		$minutes = intdiv($value, 6000);
		$seconds = ($value % 6000) / 100;
		return sprintf('%d:%05.2f', $minutes, $seconds);
	}

	return number_format($value / 100, 2, '.', '') . 's';
}

function bestResult(array $results, string|int $eventId, string $type): ?array
{
	$best = null;

	foreach ($results as $competitionId => $competitionResults) {
		foreach ($competitionResults[$eventId] ?? [] as $result) {
			$value = (int) ($result[$type] ?? -1);
			if ($value <= 0 || ($best !== null && $value >= $best[$type])) {
				continue;
			}

			$best = $result;
			$best['competitionId'] = $competitionId;
		}
	}

	return $best;
}

try {
	$person = fetchWcaJson($apiBase . '/persons/' . rawurlencode($wcaId) . '.json');
	$results = $person['results'] ?? [];
	$competitionById = [];

	function getCompetition(string $competitionId, array &$competitionById, string $apiBase): ?array
	{
		if ($competitionId === '') {
			return null;
		}

		if (!array_key_exists($competitionId, $competitionById)) {
			try {
				$competitionById[$competitionId] = fetchWcaJson(
					$apiBase . '/competitions/' . rawurlencode($competitionId) . '.json'
				);
			} catch (Throwable $error) {
				$competitionById[$competitionId] = null;
			}
		}

		return $competitionById[$competitionId];
	}

	$events = [
		'222' => '2x2',
		'333' => '3x3',
		'444' => '4x4',
		'555' => '5x5',
		'666' => '6x6',
		'777' => '7x7',
		'333bf' => '3BLD',
		'333fm' => 'FMC',
		'333oh' => '3OH',
		'clock' => 'Clock',
		'minx' => 'Mega',
		'pyram' => 'Pyra',
		'skewb' => 'Skewb',
		'sq1' => 'SQ-1',
		'444bf' => '4BLD',
		'555bf' => '5BLD',
		'333mbf' => 'MBLD',
	];

	$rows = [];
	foreach ($events as $eventId => $eventName) {
		$single = bestResult($results, $eventId, 'best');
		$average = bestResult($results, $eventId, 'average');
		$singleCompetition = getCompetition($single['competitionId'] ?? '', $competitionById, $apiBase);
		$averageCompetition = getCompetition($average['competitionId'] ?? '', $competitionById, $apiBase);

		$rows[] = [
			'event' => $eventName,
			'single' => formatResult($single['best'] ?? null, $eventId),
			'singleDate' => $singleCompetition['date']['from'] ?? 'N/A',
			'singleCompetition' => $singleCompetition['name'] ?? 'N/A',
			'singleUrl' => $singleCompetition ? 'https://www.worldcubeassociation.org/competitions/' . rawurlencode($single['competitionId']) : 'https://www.worldcubeassociation.org/competitions/',
			'average' => formatResult($average['average'] ?? null, $eventId),
			'averageDate' => $averageCompetition['date']['from'] ?? 'N/A',
			'averageCompetition' => $averageCompetition['name'] ?? 'N/A',
			'averageUrl' => $averageCompetition ? 'https://www.worldcubeassociation.org/competitions/' . rawurlencode($average['competitionId']) : 'https://www.worldcubeassociation.org/competitions/',
		];
	}

	echo json_encode(['wcaId' => $wcaId, 'records' => $rows], JSON_THROW_ON_ERROR);
} catch (Throwable $error) {
	http_response_code(502);
	echo json_encode(['error' => 'Personal records are temporarily unavailable.']);
}

