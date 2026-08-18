<?php

namespace Source\Controller;

use Source\Models\Workout;
use Source\Models\Athlete;

class Workouts extends Api
{
    public function my(array $data): void
    {
        if (!$this->authToken(3)) {
            $this->call(401, "unauthorized", "Acesso exclusivo para corredores.", "error")->back();
            return;
        }

        if (!$this->hasAthleteProfile()) {
            $this->profileNotFound();
            return;
        }

        $workouts = new Workout();
        $this->call(200, "success", "Treinos do corredor.", "success")
            ->back($workouts->selectForUser($this->userAuthId));
    }

    public function show(array $data): void
    {
        if (!$this->authToken(3)) {
            $this->call(401, "unauthorized", "Acesso exclusivo para corredores.", "error")->back();
            return;
        }

        if (!$this->hasAthleteProfile()) {
            $this->profileNotFound();
            return;
        }

        if (!isset($data["workoutId"]) || !filter_var($data["workoutId"], FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "O ID do treino deve ser um número inteiro.", "error")->back();
            return;
        }

        $workout = (new Workout())->selectOneForUser($this->userAuthId, (int)$data["workoutId"]);
        if (!$workout) {
            $this->call(404, "not_found", "Treino não encontrado para este corredor.", "error")->back();
            return;
        }

        $this->call(200, "success", "Treino encontrado.", "success")->back($workout);
    }

    public function execution(array $data): void
    {
        if (!$this->authToken(3)) {
            $this->call(401, "unauthorized", "Acesso exclusivo para corredores.", "error")->back();
            return;
        }

        if (!$this->hasAthleteProfile()) {
            $this->profileNotFound();
            return;
        }

        if (!isset($data["workoutId"]) || !filter_var($data["workoutId"], FILTER_VALIDATE_INT)) {
            $this->call(400, "bad_request", "O ID do treino deve ser um número inteiro.", "error")->back();
            return;
        }

        $status = $data["status"] ?? null;
        $allowedStatuses = ["completed", "partial", "not_completed"];
        if (!in_array($status, $allowedStatuses, true)) {
            $this->call(400, "bad_request", "O status da execução é inválido.", "error")->back();
            return;
        }

        $workouts = new Workout();
        $workout = $workouts->selectOneForUser($this->userAuthId, (int)$data["workoutId"]);
        if (!$workout) {
            $this->call(404, "not_found", "Treino não encontrado para este corredor.", "error")->back();
            return;
        }

        $execution = [
            "executed_at" => $data["executed_at"] ?? null,
            "distance_km" => $this->numberOrNull($data["distance_km"] ?? null),
            "duration_minutes" => $this->integerOrNull($data["duration_minutes"] ?? null),
            "perceived_exertion" => $this->integerOrNull($data["perceived_exertion"] ?? null),
            "feeling" => isset($data["feeling"]) ? trim((string)$data["feeling"]) : null,
            "notes" => isset($data["notes"]) ? trim((string)$data["notes"]) : null,
            "status" => $status
        ];

        if ($execution["perceived_exertion"] !== null &&
            ($execution["perceived_exertion"] < 1 || $execution["perceived_exertion"] > 10)) {
            $this->call(400, "bad_request", "A percepção de esforço deve estar entre 1 e 10.", "error")->back();
            return;
        }

        if (!$workouts->saveExecution((int)$data["workoutId"], (int)$workout->athlete_id, $execution)) {
            $this->call(500, "internal_server_error", $workouts->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200, "success", "Execução registrada com sucesso.", "success")
            ->back($workouts->selectOneForUser($this->userAuthId, (int)$data["workoutId"]));
    }

    public function executions(array $data): void
    {
        if (!$this->authToken(3)) {
            $this->call(401, "unauthorized", "Acesso exclusivo para corredores.", "error")->back();
            return;
        }

        if (!$this->hasAthleteProfile()) {
            $this->profileNotFound();
            return;
        }

        $workouts = new Workout();
        $this->call(200, "success", "Execuções do corredor.", "success")
            ->back($workouts->selectExecutionsForUser($this->userAuthId));
    }

    private function numberOrNull(mixed $value): ?float
    {
        return $value === null || $value === "" || !is_numeric($value) ? null : (float)$value;
    }

    private function integerOrNull(mixed $value): ?int
    {
        return $value === null || $value === "" || !filter_var($value, FILTER_VALIDATE_INT) ? null : (int)$value;
    }

    private function hasAthleteProfile(): bool
    {
        return (new Athlete())->selectByUserId($this->userAuthId) !== null;
    }

    private function profileNotFound(): void
    {
        $this->call(
            404,
            "athlete_profile_not_found",
            "Seu usuário ainda não possui um perfil de corredor vinculado.",
            "error"
        )->back();
    }
}
