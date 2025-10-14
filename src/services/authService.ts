import { apiLoginUser } from './api'

export async function loginUser(email: string, senha: string) {
	const request = apiLoginUser('/usuarios/login', {
		method: 'POST',
		body: JSON.stringify({ email, senha })
	})

	return request
}
