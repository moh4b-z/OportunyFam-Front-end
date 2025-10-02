import { useState } from 'react'

interface InputProps {
	srcImage: string
	extImage?: string
	extImageName?: string
	inputName: string
	placeholder: string
	type?: string
	value: string
	onChange: (value: string) => void
}

export default function Input({ srcImage, extImage, extImageName, inputName, placeholder, type = 'text', value, onChange }: InputProps) {
	const [showPassword, setShowPassword] = useState(false)
	const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type

	return (
		<div className="input_container">
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
