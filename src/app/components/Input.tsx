import { useState } from 'react'

interface InputProps {
	srcImage: string
	extImage?: string
	inputName: string
	placeholder: string
	type?: string
	value: string
	className?: string
	onChange: (value: string) => void
}

export default function Input({ srcImage, extImage, inputName, placeholder, type = 'text', value, className, onChange }: InputProps) {
	const [showPassword, setShowPassword] = useState(false)
	const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type

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

			<input type={inputType} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
		</div>
	)
}
