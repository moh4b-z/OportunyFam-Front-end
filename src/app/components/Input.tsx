import { useState } from 'react'

interface InputProps {
	srcImage: string
	extImage?: string
	inputName: string
	placeholder: string
	type?: string
	value: string
	name?: string
	className?: string
	isLoading?: boolean
	disabled?: boolean
	readonly?: boolean
	maxLength?: number
	mask?: 'cep' | 'cpf' | 'cnpj' | 'phone' | 'email'
	onChange: (value: string) => void
	onBlur?: (value: string) => void
	onComplete?: (value: string) => void
}

export default function Input({ 
	srcImage, 
	extImage, 
	inputName, 
	placeholder, 
	type = 'text', 
	value, 
	name,
	className, 
	isLoading = false, 
	disabled = false,
	readonly = false,
	maxLength,
	mask,
	onChange, 
	onBlur,
	onComplete 
}: InputProps) {
	const [showPassword, setShowPassword] = useState(false)
	const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type

	// Função para aplicar máscara
	const applyMask = (value: string, maskType: string) => {
		switch (maskType) {
			case 'cep':
				// Remove todos os caracteres não numéricos
				const cepNumbers = value.replace(/\D/g, '')
				// Máscara: 00000-000
				if (cepNumbers.length <= 5) {
					return cepNumbers
				}
				return cepNumbers.slice(0, 5) + '-' + cepNumbers.slice(5, 8)
			
			case 'cpf':
				// Remove todos os caracteres não numéricos
				const cpfNumbers = value.replace(/\D/g, '')
				// Máscara: 000.000.000-00
				if (cpfNumbers.length <= 3) {
					return cpfNumbers
				} else if (cpfNumbers.length <= 6) {
					return cpfNumbers.slice(0, 3) + '.' + cpfNumbers.slice(3)
				} else if (cpfNumbers.length <= 9) {
					return cpfNumbers.slice(0, 3) + '.' + cpfNumbers.slice(3, 6) + '.' + cpfNumbers.slice(6)
				}
				return cpfNumbers.slice(0, 3) + '.' + cpfNumbers.slice(3, 6) + '.' + cpfNumbers.slice(6, 9) + '-' + cpfNumbers.slice(9, 11)
			
			case 'cnpj':
				// Remove todos os caracteres não numéricos
				const cnpjNumbers = value.replace(/\D/g, '')
				// Máscara: 00.000.000/0000-00
				if (cnpjNumbers.length <= 2) {
					return cnpjNumbers
				} else if (cnpjNumbers.length <= 5) {
					return cnpjNumbers.slice(0, 2) + '.' + cnpjNumbers.slice(2)
				} else if (cnpjNumbers.length <= 8) {
					return cnpjNumbers.slice(0, 2) + '.' + cnpjNumbers.slice(2, 5) + '.' + cnpjNumbers.slice(5)
				} else if (cnpjNumbers.length <= 12) {
					return cnpjNumbers.slice(0, 2) + '.' + cnpjNumbers.slice(2, 5) + '.' + cnpjNumbers.slice(5, 8) + '/' + cnpjNumbers.slice(8)
				}
				return cnpjNumbers.slice(0, 2) + '.' + cnpjNumbers.slice(2, 5) + '.' + cnpjNumbers.slice(5, 8) + '/' + cnpjNumbers.slice(8, 12) + '-' + cnpjNumbers.slice(12, 14)
			
			case 'phone':
				// Remove todos os caracteres não numéricos
				const phoneNumbers = value.replace(/\D/g, '')
				// Máscara: (00) 00000-0000 ou (00) 0000-0000
				if (phoneNumbers.length <= 2) {
					return phoneNumbers
				} else if (phoneNumbers.length <= 7) {
					return '(' + phoneNumbers.slice(0, 2) + ') ' + phoneNumbers.slice(2)
				} else if (phoneNumbers.length <= 10) {
					return '(' + phoneNumbers.slice(0, 2) + ') ' + phoneNumbers.slice(2, 6) + '-' + phoneNumbers.slice(6)
				} else {
					// Celular com 9 dígitos
					return '(' + phoneNumbers.slice(0, 2) + ') ' + phoneNumbers.slice(2, 7) + '-' + phoneNumbers.slice(7, 11)
				}
			
			case 'email':
				// Para email, apenas converte para minúsculo e remove espaços
				return value.toLowerCase().replace(/\s/g, '')
			
			default:
				return value
		}
	}

	// Função para obter o valor limpo (sem máscara) para enviar ao backend
	const getCleanValue = (value: string, maskType?: string) => {
		if (!maskType) return value
		
		switch (maskType) {
			case 'cep':
			case 'cpf':
			case 'cnpj':
			case 'phone':
				return value.replace(/\D/g, '')
			case 'email':
				return value.toLowerCase().replace(/\s/g, '')
			default:
				return value
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let newValue = e.target.value
		let cleanValue = newValue

		// Aplica máscara se especificada
		if (mask) {
			newValue = applyMask(newValue, mask)
			cleanValue = getCleanValue(newValue, mask)
		}

		// Verifica limites de comprimento baseado na máscara
		if (mask) {
			const maxLengths = {
				'cep': 8,
				'cpf': 11,
				'cnpj': 14,
				'phone': 11,
				'email': 100
			}
			
			if (maxLengths[mask] && cleanValue.length > maxLengths[mask]) {
				return
			}
		}

		// Aplica limite de caracteres personalizado se especificado
		if (maxLength && newValue.length > maxLength) {
			return
		}

		// Envia o valor limpo para o backend, mas mostra o valor com máscara
		onChange(cleanValue)

		// Verifica se o campo está completo para chamar onComplete
		if (onComplete && mask) {
			let expectedLength = 0

			switch (mask) {
				case 'cep':
					expectedLength = 8
					break
				case 'cpf':
					expectedLength = 11
					break
				case 'cnpj':
					expectedLength = 14
					break
				case 'phone':
					expectedLength = 10 // Telefone fixo mínimo
					break
			}

			if (cleanValue.length >= expectedLength) {
				onComplete(cleanValue)
			}
		}
	}

	// Função para obter o valor formatado para exibição
	const getDisplayValue = () => {
		if (!mask || !value) return value
		return applyMask(value, mask)
	}

	return (
		<div className={`input_container ${className || ''}`}>
			<img src={srcImage} alt={`${inputName} icon`} />
			{extImage && type === 'password' && (
				<img
					src={showPassword ? '/icons-eye-on.svg' : '/icons-eye-off.svg'}
					alt={showPassword ? 'eye-on icon' : 'eye-off icon'}
					onClick={() => setShowPassword(!showPassword)}
					style={{ cursor: 'pointer' }}
				/>
			)}

			{isLoading && (
				<div className="input_loading">
					<div className="spinner"></div>
				</div>
			)}

			<input 
				type={inputType} 
				name={name}
				value={getDisplayValue()} 
				placeholder={placeholder} 
				disabled={disabled || isLoading}
				readOnly={readonly}
				onChange={handleChange}
				onBlur={(e) => onBlur && onBlur(getCleanValue(e.target.value, mask))}
			/>
		</div>
	)
}
