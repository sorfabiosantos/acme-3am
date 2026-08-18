<?php

namespace Source\Controller;

use Source\Models\Athlete;

class Athletes extends Api
{
    public function me(array $data): void
    {
        if (!$this->authToken(3)) {
            $this->call(401, "unauthorized", "Acesso exclusivo para corredores.", "error")->back();
            return;
        }

        $athlete = (new Athlete())->selectByUserId($this->userAuthId);
        if (!$athlete) {
            $this->call(404, "athlete_profile_not_found", "Seu usuário ainda não possui um perfil de corredor vinculado.", "error")->back();
            return;
        }

        $this->call(200, "success", "Perfil do corredor encontrado.", "success")->back($athlete);
    }

    public function update(array $data): void
    {
        if (!$this->authToken(3)) {
            $this->call(401, "unauthorized", "Acesso exclusivo para corredores.", "error")->back();
            return;
        }

        $athlete = new Athlete();
        if (!$athlete->selectByUserId($this->userAuthId)) {
            $this->call(404, "athlete_profile_not_found", "Seu usuário ainda não possui um perfil de corredor vinculado.", "error")->back();
            return;
        }

        if (!$athlete->updateByUserId($this->userAuthId, $data)) {
            $this->call(400, "bad_request", $athlete->getErrorMessage(), "error")->back();
            return;
        }

        $this->call(200, "success", "Perfil atualizado com sucesso.", "success")
            ->back((new Athlete())->selectByUserId($this->userAuthId));
    }
}
