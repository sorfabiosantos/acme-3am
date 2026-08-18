<?php

namespace Source\Controller;

use Source\Models\Athlete;
use Source\Models\Progress as ProgressModel;

class Progress extends Api
{
    public function my(array $data): void
    {
        if (!$this->authToken(3)) {
            $this->call(401, "unauthorized", "Acesso exclusivo para corredores.", "error")->back();
            return;
        }

        if (!(new Athlete())->selectByUserId($this->userAuthId)) {
            $this->call(404, "athlete_profile_not_found", "Seu usuário ainda não possui um perfil de corredor vinculado.", "error")->back();
            return;
        }

        $progress = new ProgressModel();
        $this->call(200, "success", "Evolução do corredor.", "success")->back([
            "summary" => $progress->summaryForUser($this->userAuthId),
            "history" => $progress->historyForUser($this->userAuthId)
        ]);
    }
}
