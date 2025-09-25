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
	return (
		<div className="input_container">
			<img src={srcImage} alt={`${inputName} icon`} />
			{extImage != undefined && <img src={extImage} alt={`${extImageName} icon`}></img>}

			<input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
		</div>
	)
}
