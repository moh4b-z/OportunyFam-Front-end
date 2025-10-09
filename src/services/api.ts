const BASE_URL = 'http://localhost:8080/v1/oportunyfam/'

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
	try {
		const response = await fetch(`${BASE_URL}${endpoint}`, {
			headers: {
				'Content-Type': 'application/json',
				...(options.headers || {})
			},
			...options
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new Error(errorData.message || `Erro: ${response.status}`)
		}

		return await response.json()
	} catch (error) {
		console.error('Erro na API:', error)
		throw error
	}
}
