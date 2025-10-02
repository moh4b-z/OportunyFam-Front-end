import { MouseEventHandler } from 'react'

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
	const handlePasswordClick = (e: React.MouseEvent<HTMLImageElement>) => {
		const targetElement = e.currentTarget as HTMLImageElement
		const parentElement = targetElement.parentElement
		const inputElement = parentElement?.querySelector('input') as HTMLInputElement
		inputElement.type = 'text'

		// if (inputElement.type === 'password' && targetElement.alt === 'eye-off icon') {
		// 	inputElement.type = 'text'
		// 	targetElement.src = '/icons-eye-on.svg'
		// 	targetElement.alt = 'eye-on icon'
		// } else if (inputElement.type === 'text' && targetElement.alt === 'eye-on icon') {
		// 	inputElement.type = 'password'
		// 	targetElement.src = '/icons-eye-off.svg'
		// 	targetElement.alt = 'eye-off icon'
		// }
	}

	return (
		<div className="input_container">
			<img src={srcImage} alt={`${inputName} icon`} />
			{extImage != undefined && <img src={extImage} alt={`${extImageName} icon`} onClick={handlePasswordClick}></img>}

			<input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
		</div>
	)
}
