const BASE_URL = 'http://localhost:3030/v1/oportunyfam'

export async function apiLoginUser(endpoint: string, options: RequestInit = {}) {
	try {
		const response = await fetch(`${BASE_URL}${endpoint}`, {
			headers: {
				'Content-Type': 'application/json',
				...(options.headers || {})
			},
			...options
		})

		return response
	} catch (error) {
		return
	}
}
