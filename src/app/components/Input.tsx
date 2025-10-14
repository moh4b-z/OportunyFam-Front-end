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
	mask?: 'cep' | 'cpf' | 'cnpj' | 'phone'
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
	const applyMask = (value: string, maskType?: string) => {
		if (!maskType) return value

		// Remove todos os caracteres não numéricos
		const numbers = value.replace(/\D/g, '')

		switch (maskType) {
			case 'cep':
				return numbers.slice(0, 8) // Máximo 8 dígitos para CEP
			case 'cpf':
				return numbers.slice(0, 11) // Máximo 11 dígitos para CPF
			case 'cnpj':
				return numbers.slice(0, 14) // Máximo 14 dígitos para CNPJ
			case 'phone':
				return numbers.slice(0, 11) // Máximo 11 dígitos para telefone
			default:
				return numbers
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let newValue = e.target.value

		// Aplica máscara se especificada
		if (mask) {
			newValue = applyMask(newValue, mask)
		}

		// Aplica maxLength se especificado
		if (maxLength && newValue.length > maxLength) {
			newValue = newValue.slice(0, maxLength)
		}

		onChange(newValue)

		// Chama onComplete quando atingir o comprimento esperado
		if (onComplete && mask === 'cep' && newValue.length === 8) {
			onComplete(newValue)
		}
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
				value={value} 
				placeholder={placeholder} 
				disabled={disabled || isLoading}
				readOnly={readonly}
				onChange={handleChange}
				onBlur={(e) => onBlur && onBlur(e.target.value)}
			/>
		</div>
	)
}
