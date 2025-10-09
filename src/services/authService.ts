import { apiFetch } from './api'

export async function loginUser(email: string, senha: string) {
	return apiFetch('/instituicoes/login', {
		method: 'POST',
		body: JSON.stringify({ email, senha })
	})
}
