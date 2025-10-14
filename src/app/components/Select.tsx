import { useState, useEffect, useRef } from 'react'

interface SelectOption {
	value: string
	label: string
}

interface SelectProps {
	srcImage: string
	inputName: string
	placeholder: string
	value: string
	name?: string
	options: SelectOption[]
	className?: string
	onChange: (value: string) => void
	onLoadOptions?: () => Promise<SelectOption[]>
}

export default function Select({ 
	srcImage, 
	inputName, 
	placeholder, 
	value, 
	name,
	options: initialOptions,
	className, 
	onChange,
	onLoadOptions 
}: SelectProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [options, setOptions] = useState<SelectOption[]>(initialOptions)
	const [isLoading, setIsLoading] = useState(false)
	const selectRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (onLoadOptions && options.length === 0) {
			loadOptions()
		}
	}, [onLoadOptions])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const loadOptions = async () => {
		if (!onLoadOptions) return
		
		setIsLoading(true)
		try {
			const newOptions = await onLoadOptions()
			setOptions(newOptions)
		} catch (error) {
			console.error('Erro ao carregar opções:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const selectedOption = options.find(option => option.value === value)

	const handleOptionClick = (optionValue: string) => {
		onChange(optionValue)
		setIsOpen(false)
	}

	return (
		<div className={`select_container ${className || ''}`} ref={selectRef}>
			<img src={srcImage} alt={`${inputName} icon`} />
			
			<div className="select_wrapper">
				<div 
					className={`select_input ${isOpen ? 'select_open' : ''}`}
					onClick={() => setIsOpen(!isOpen)}
				>
					<span className={selectedOption ? 'select_value' : 'select_placeholder'}>
						{selectedOption ? selectedOption.label : placeholder}
					</span>
					<img 
						src="/icons-arrow-down.svg" 
						alt="arrow down" 
						className={`select_arrow ${isOpen ? 'select_arrow_up' : ''}`}
					/>
				</div>

				{isOpen && (
					<div className="select_dropdown">
						{isLoading ? (
							<div className="select_loading">Carregando...</div>
						) : (
							options.map((option) => (
								<div
									key={option.value}
									className={`select_option ${value === option.value ? 'select_option_selected' : ''}`}
									onClick={() => handleOptionClick(option.value)}
								>
									{option.label}
								</div>
							))
						)}
					</div>
				)}
			</div>
		</div>
	)
}
