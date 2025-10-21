import { useState, useEffect, useRef } from 'react'

interface MultiSelectOption {
	value: string
	label: string
}

interface MultiSelectProps {
	srcImage: string
	inputName: string
	placeholder: string
	selectedValues: string[]
	name?: string
	options: MultiSelectOption[]
	className?: string
	onChange: (values: string[]) => void
	onLoadOptions?: () => Promise<MultiSelectOption[]>
}

export default function MultiSelect({ 
	srcImage, 
	inputName, 
	placeholder, 
	selectedValues, 
	name,
	options: initialOptions,
	className, 
	onChange,
	onLoadOptions 
}: MultiSelectProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [options, setOptions] = useState<MultiSelectOption[]>(initialOptions)
	const [isLoading, setIsLoading] = useState(false)
	const selectRef = useRef<HTMLDivElement>(null)

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
		if (onLoadOptions && options.length === 0) {
			setIsLoading(true)
			try {
				const loadedOptions = await onLoadOptions()
				setOptions(loadedOptions)
			} catch (error) {
				console.error('Erro ao carregar opções:', error)
			} finally {
				setIsLoading(false)
			}
		}
	}

	const handleToggle = () => {
		setIsOpen(!isOpen)
		if (!isOpen) {
			loadOptions()
		}
	}

	const handleOptionToggle = (value: string) => {
		const newSelectedValues = selectedValues.includes(value)
			? selectedValues.filter(v => v !== value)
			: [...selectedValues, value]
		
		onChange(newSelectedValues)
	}

	const getDisplayText = () => {
		if (selectedValues.length === 0) {
			return placeholder
		}
		
		if (selectedValues.length === 1) {
			const option = options.find(opt => opt.value === selectedValues[0])
			return option?.label || selectedValues[0]
		}
		
		return `${selectedValues.length} opções selecionadas`
	}

	const getSelectedLabels = () => {
		return selectedValues.map(value => {
			const option = options.find(opt => opt.value === value)
			return option?.label || value
		})
	}

	return (
		<div className={`multiselect_container ${className || ''}`} ref={selectRef}>
			<img src={srcImage} alt={`${inputName} icon`} />
			
			<div className="multiselect_display" onClick={handleToggle}>
				<div className="multiselect_text">
					{getDisplayText()}
				</div>
				<div className="multiselect_arrow">
					<svg 
						width="12" 
						height="8" 
						viewBox="0 0 12 8" 
						fill="none" 
						style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
					>
						<path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
					</svg>
				</div>
			</div>

			{selectedValues.length > 0 && (
				<div className="multiselect_tags">
					{getSelectedLabels().map((label, index) => (
						<span key={index} className="multiselect_tag">
							{label}
							<button 
								type="button"
								onClick={(e) => {
									e.stopPropagation()
									handleOptionToggle(selectedValues[index])
								}}
								className="multiselect_tag_remove"
							>
								×
							</button>
						</span>
					))}
				</div>
			)}

			{isOpen && (
				<div className="multiselect_dropdown">
					{isLoading ? (
						<div className="multiselect_loading">
							<div className="spinner"></div>
							Carregando...
						</div>
					) : options.length === 0 ? (
						<div className="multiselect_empty">Nenhuma opção disponível</div>
					) : (
						options.map((option) => (
							<div 
								key={option.value} 
								className={`multiselect_option ${selectedValues.includes(option.value) ? 'selected' : ''}`}
								onClick={() => handleOptionToggle(option.value)}
							>
								<input 
									type="checkbox" 
									checked={selectedValues.includes(option.value)}
									onChange={() => {}} // Controlado pelo onClick do div
									name={name}
									value={option.value}
								/>
								<span>{option.label}</span>
							</div>
						))
					)}
				</div>
			)}
		</div>
	)
}
