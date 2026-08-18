<?php

namespace Source\Controller;

use Source\Models\Race;
use Source\Models\Athlete;

class Races extends Api
{
    public function my(array $data): void
    {
        if (!$this->authToken(3)) {
            $this->call(401, "unauthorized", "Acesso exclusivo para corredores.", "error")->back();
            return;
        }

        if (!(new Athlete())->selectByUserId($this->userAuthId)) {
            $this->call(
                404,
                "athlete_profile_not_found",
                "Seu usuário ainda não possui um perfil de corredor vinculado.",
                "error"
            )->back();
            return;
        }

        $races = new Race();
        $this->call(200, "success", "Provas do corredor.", "success")
            ->back($races->selectForUser($this->userAuthId));
    }
}
