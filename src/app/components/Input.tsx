import { useState } from 'react'

interface InputProps {
	srcImage: string
	inputName: string
	type?: string
	value: string
	onChange: (value: string) => void
}

export default function Input({ srcImage, inputName, type = 'text', value, onChange }: InputProps) {
	return (
		<div className="input_container">
			<img src={srcImage} alt={`${inputName} icon`} />
			<label>
				{inputName}
				<input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
			</label>
		</div>
	)
}
