import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/services/config'
import Link from 'next/link'
import Input from './Input'
import Select from './Select'
import MultiSelect from './MultiSelect'
import SwitchButtons from './Switch'
import { authService, institutionService, userService, utilsService } from '@/services'

interface CardSystemProps {
	onTabChange?: (tab: 'login' | 'register') => void
}

export default function CardSystem({ onTabChange }: CardSystemProps) {
	const [loginEmail, setLoginEmail] = useState<string>('')
	const [responsableRegisterEmail, setResponsableRegisterEmail] = useState<string>('')
	const [kidRegisterEmail, setKidRegisterEmail] = useState<string>('')
	const [ongRegisterEmail, setOngRegisterEmail] = useState<string>('')
	const [loginPassword, setLoginPassword] = useState<string>('')
	const [responsableRegisterPassword, setResponsableRegisterPassword] = useState<string>('')
	const [kidRegisterPassword, setKidRegisterPassword] = useState<string>('')
	const [ongRegisterPassword, setOngRegisterPassword] = useState<string>('')
	const [confirmResponsablePassword, setConfirmResponsablePassword] = useState<string>('')
	const [confirmKidPassword, setConfirmKidPassword] = useState<string>('')
	const [confirmOngPassword, setConfirmOngPassword] = useState<string>('')
	const [responsableName, setResponsableName] = useState<string>('')
	const [kidName, setKidName] = useState<string>('')
	const [ongName, setOngName] = useState<string>('')
	const [responsablePhone, setResponsablePhone] = useState<string>('')
	const [kidPhone, setKidPhone] = useState<string>('')
	const [ongPhone, setOngPhone] = useState<string>('')
	const [responsableDateOfBirth, setResponsableDateOfBirth] = useState<string>('')
	const [kidDateOfBirth, setKidDateOfBirth] = useState<string>('')
	const [responsableCpf, setResponsableCpf] = useState<string>('')
	const [kidCpf, setKidCpf] = useState<string>('')
	const [ongCnpj, setOngCnpj] = useState<string>('')
	const [kidCpfResponsable, setKidCpfResponsable] = useState<string>('')
	const [responsableAddress, setResponsableAddress] = useState<string>('')
	const [responsableGender, setResponsableGender] = useState<string>('')
	const [ongAdress, setOngAdress] = useState<string>('')
	
	// Estados para endereço do responsável
	const [responsableLogradouro, setResponsableLogradouro] = useState<string>('')
	const [responsableBairro, setResponsableBairro] = useState<string>('')
	const [responsableCidade, setResponsableCidade] = useState<string>('')
	const [responsableUf, setResponsableUf] = useState<string>('')
	const [responsableNumero, setResponsableNumero] = useState<string>('')
	const [responsableComplemento, setResponsableComplemento] = useState<string>('')
	const [responsableAddressVisible, setResponsableAddressVisible] = useState<boolean>(false)
	
	// Estados para endereço da ONG
	const [ongLogradouro, setOngLogradouro] = useState<string>('')
	const [ongBairro, setOngBairro] = useState<string>('')
	const [ongCidade, setOngCidade] = useState<string>('')
	const [ongUf, setOngUf] = useState<string>('')
	const [ongNumero, setOngNumero] = useState<string>('')
	const [ongComplemento, setOngComplemento] = useState<string>('')
	const [ongAddressVisible, setOngAddressVisible] = useState<boolean>(false)
	const [ongTiposInstituicao, setOngTiposInstituicao] = useState<string[]>([])
	const [selectedOption, setSelectedOption] = useState<string>('responsavel')
	const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
	const [step, setStep] = useState<number>(0)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [loginErrorMessage, setLoginErrorMessage] = useState<string | false>(false)

	// Notifica o estado inicial do tab
	useEffect(() => {
		onTabChange?.(activeTab)
	}, [onTabChange])
	const [registerErrorMessage, setRegisterErrorMessage] = useState<string | false>(false)
	const [isCepLoading, setIsCepLoading] = useState<boolean>(false)
	const [ongCepLoading, setOngCepLoading] = useState<boolean>(false)
	const canGoBack = step > 0

	// Função para carregar opções de gênero da API
	const loadGenderOptions = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/sexos`)
			if (!response.ok) {
				throw new Error('Erro ao carregar opções de gênero')
			}
			const data = await response.json()
			
			// Verifica se a resposta é um array ou se está dentro de uma propriedade
			let genderArray = data
			
			// Se não for array, verifica se tem uma propriedade que contém o array
			if (!Array.isArray(data)) {
				// Possíveis propriedades onde pode estar o array
				if (data.data && Array.isArray(data.data)) {
					genderArray = data.data
				} else if (data.sexos && Array.isArray(data.sexos)) {
					genderArray = data.sexos
				} else if (data.results && Array.isArray(data.results)) {
					genderArray = data.results
				} else {
					throw new Error('Formato de resposta inválido')
				}
			}
			
			// Mapeia os dados da API para o formato esperado pelo componente Select
			return genderArray.map((item: any) => ({
				value: item.id.toString(),
				label: item.nome
			}))
		} catch (error) {
			console.error('Erro ao carregar gêneros:', error)
			// Retorna opções padrão em caso de erro
			return [
				{ value: 'masculino', label: 'Masculino' },
				{ value: 'feminino', label: 'Feminino' },
				{ value: 'outro', label: 'Outro' },
				{ value: 'prefiro_nao_dizer', label: 'Prefiro não dizer' }
			]
		}
	}

	// Função para carregar tipos de instituição da API
	const loadInstitutionTypes = async () => {
		try {
			return await institutionService.getTypes()
		} catch (error) {
			console.error('Erro ao carregar tipos de instituição:', error)
			// Retorna opções padrão em caso de erro
			return [
				{ value: 'educacao', label: 'Educação' },
				{ value: 'saude', label: 'Saúde' },
				{ value: 'assistencia_social', label: 'Assistência Social' },
				{ value: 'cultura', label: 'Cultura' },
				{ value: 'esporte', label: 'Esporte' },
				{ value: 'meio_ambiente', label: 'Meio Ambiente' }
			]
		}
	}

	// Função para consultar CEP na API ViaCEP
	const consultarCEP = async (cep: string, isOng: boolean = false) => {
		// Remove caracteres não numéricos do CEP
		const cepLimpo = cep.replace(/\D/g, '')
		
		// Verifica se o CEP tem 8 dígitos
		if (cepLimpo.length !== 8) {
			return
		}

		// Define qual loading usar baseado no tipo (responsável ou ONG)
		const setLoading = isOng ? setOngCepLoading : setIsCepLoading
		
		setLoading(true)
		// Limpa mensagem de erro anterior relacionada ao CEP
		setRegisterErrorMessage(false)
		
		try {
			const data = await utilsService.getCepData(cepLimpo)
			
			if (isOng) {
				setOngLogradouro(data.logradouro || '')
				setOngBairro(data.bairro || '')
				setOngCidade(data.cidade || '')
				setOngUf(data.estado || '')
				setOngAddressVisible(true)
			} else {
				setResponsableLogradouro(data.logradouro || '')
				setResponsableBairro(data.bairro || '')
				setResponsableCidade(data.cidade || '')
				setResponsableUf(data.estado || '')
				setResponsableAddressVisible(true)
			}
			
		} catch (error) {
			console.error('Erro ao consultar CEP:', error)
			const message = error instanceof Error ? error.message : ''
			if (message && message.toLowerCase().includes('não encontrado')) {
				setRegisterErrorMessage('CEP não encontrado. Verifique o CEP e tente novamente.')
			} else {
				setRegisterErrorMessage('Não foi possível buscar o CEP. Tente novamente mais tarde.')
			}
			if (isOng) {
				setOngLogradouro('')
				setOngBairro('')
				setOngCidade('')
				setOngUf('')
				setOngAddressVisible(false)
			} else {
				setResponsableLogradouro('')
				setResponsableBairro('')
				setResponsableCidade('')
				setResponsableUf('')
				setResponsableAddressVisible(false)
			}
		} finally {
			setLoading(false)
		}
	}

	const handleNext = async () => {
		// Limpa mensagens de erro anteriores
		setRegisterErrorMessage(false)

		if (!selectedOption) {
			setRegisterErrorMessage('Por favor, selecione uma opção antes de continuar.')
			return
		}

		// Se estiver no step 1 (último step), fazer o registro
		if (step === 1) {
			if (selectedOption === 'ong') {
				await registerInstitution()
			} else if (selectedOption === 'responsavel') {
				await registerResponsible()
			}
			return
		}

		// Caso contrário, avançar para o próximo step
		setStep(step + 1)
		return
	}

	const handleBack = () => {
		if (!canGoBack) return
		setStep(step - 1)
		// Limpa mensagens de erro ao voltar
		setRegisterErrorMessage(false)
	}

	// Função para validar senhas em tempo real
	const validatePasswords = (password: string, confirmPassword: string, type: 'responsavel' | 'ong') => {
		if (confirmPassword && password !== confirmPassword) {
			setRegisterErrorMessage('As senhas não coincidem')
		} else if (registerErrorMessage === 'As senhas não coincidem') {
			setRegisterErrorMessage(false)
		}
	}

	// Função para registrar instituição
	const registerInstitution = async () => {
		try {
			setIsLoading(true)
			setRegisterErrorMessage(false)

			// Validações básicas
			const missingFields = []
			if (!ongName) missingFields.push('Nome da instituição')
			if (!ongRegisterEmail) missingFields.push('Email')
			if (!ongPhone) missingFields.push('Telefone')
			if (!ongCnpj) missingFields.push('CNPJ')
			if (!ongRegisterPassword) missingFields.push('Senha')
			if (!confirmOngPassword) missingFields.push('Confirmação de senha')
			if (!ongAdress) missingFields.push('CEP')
			
			if (missingFields.length > 0) {
				const errorMsg = `Por favor, preencha os seguintes campos: ${missingFields.join(', ')}`
				setRegisterErrorMessage(errorMsg)
				setIsLoading(false)
				return
			}

			if (ongRegisterPassword !== confirmOngPassword) {
				setRegisterErrorMessage('As senhas não coincidem')
				setIsLoading(false)
				return
			}

			if (ongTiposInstituicao.length === 0) {
				setRegisterErrorMessage('Selecione pelo menos um tipo de instituição')
				setIsLoading(false)
				return
			}

			// Prepara os dados para envio
			const institutionData = {
				nome: ongName,
				logo: "", // Vazio por padrão
				cnpj: ongCnpj, // Já vem limpo do componente Input
				telefone: ongPhone, // Já vem limpo do componente Input
				email: ongRegisterEmail,
				senha: ongRegisterPassword,
				descricao: "", // Vazio por padrão
				cep: ongAdress, // CEP limpo
				logradouro: ongLogradouro,
				numero: ongNumero || "",
				complemento: ongComplemento || "",
				bairro: ongBairro,
				cidade: ongCidade,
				estado: ongUf,
				tipos_instituicao: ongTiposInstituicao.map(id => parseInt(id)) // Converte para array de números
			}

			const response = await institutionService.register(institutionData)
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.message || 'Erro ao cadastrar instituição')
			}

			// Aqui você pode redirecionar ou mostrar mensagem de sucesso
			alert('Instituição cadastrada com sucesso!')

		} catch (error) {
			console.error('Erro ao cadastrar instituição:', error)
			setRegisterErrorMessage(error instanceof Error ? error.message : 'Erro ao cadastrar instituição')
		} finally {
			setIsLoading(false)
		}
	}

	// Função para registrar responsável
	const registerResponsible = async () => {
		try {
			setIsLoading(true)
			setRegisterErrorMessage(false)

			// Validações básicas
			const missingFields = []
			if (!responsableName) missingFields.push('Nome')
			if (!responsableRegisterEmail) missingFields.push('Email')
			if (!responsablePhone) missingFields.push('Telefone')
			if (!responsableCpf) missingFields.push('CPF')
			if (!responsableRegisterPassword) missingFields.push('Senha')
			if (!confirmResponsablePassword) missingFields.push('Confirmação de senha')
			if (!responsableDateOfBirth) missingFields.push('Data de nascimento')
			if (!responsableAddress) missingFields.push('CEP')
			
			if (missingFields.length > 0) {
				setRegisterErrorMessage(`Por favor, preencha os seguintes campos: ${missingFields.join(', ')}`)
				setIsLoading(false)
				return
			}

			if (responsableRegisterPassword !== confirmResponsablePassword) {
				setRegisterErrorMessage('As senhas não coincidem')
				setIsLoading(false)
				return
			}

			if (!responsableGender) {
				setRegisterErrorMessage('Por favor, selecione o gênero')
				setIsLoading(false)
				return
			}

			// Prepara os dados para envio
			const responsibleData = {
				nome: responsableName,
				foto_perfil: "", // Vazio por padrão
				email: responsableRegisterEmail,
				senha: responsableRegisterPassword,
				data_nascimento: responsableDateOfBirth,
				cpf: responsableCpf, // Já vem limpo do componente Input
				telefone: responsablePhone, // Já vem limpo do componente Input
				id_sexo: parseInt(responsableGender), // Converte para número
				id_tipo_nivel: 1, // 1 por padrão
				cep: responsableAddress, // CEP limpo
				logradouro: responsableLogradouro,
				numero: responsableNumero || "",
				complemento: responsableComplemento || "",
				bairro: responsableBairro,
				cidade: responsableCidade,
				estado: responsableUf
			}

			const response = await userService.register(responsibleData)
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.message || 'Erro ao cadastrar responsável')
			}

			// Aqui você pode redirecionar ou mostrar mensagem de sucesso
			alert('Responsável cadastrado com sucesso!')

		} catch (error) {
			console.error('Erro ao cadastrar responsável:', error)
			setRegisterErrorMessage(error instanceof Error ? error.message : 'Erro ao cadastrar responsável')
		} finally {
			setIsLoading(false)
		}
	}

	const handleLogin = async () => {
		setIsLoading(true)
		setLoginErrorMessage(false)

		try {
			const data = await authService.login({
				email: loginEmail,
				password: loginPassword
			})

			if (data && data.status) {
				// Login bem-sucedido
				console.log('Login realizado com sucesso:', data)
			} else {
				setLoginErrorMessage('Email ou senha incorretos')
			}
		} catch (error) {
			console.error('Erro no login:', error)
			const errorMessage = error instanceof Error ? error.message : 'Erro de conexão. Verifique sua internet.'
			setLoginErrorMessage(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	// Função para detectar Enter e fazer login
	const handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter' && activeTab === 'login' && !isLoading) {
			event.preventDefault()
			handleLogin()
		}
	}

	// Função para trocar de aba e limpar erros
	const handleTabChange = (newTab: 'login' | 'register') => {
		setActiveTab(newTab)
		// Limpa os erros quando troca de aba
		setLoginErrorMessage(false)
		setRegisterErrorMessage(false)
		// Notifica o componente pai sobre a mudança
		onTabChange?.(newTab)
	}

	return (
		<div className="card_container">
			<SwitchButtons activeTab={activeTab} setActiveTab={handleTabChange} />
			<div className={`card_login ${activeTab === 'login' ? 'form_active' : ''}`}>
				<div className="inputs">
								<Input
									srcImage="/icons-email.svg"
									inputName="Email"
									placeholder="seu@email.com"
									type="email"
									name="login_email"
									mask="email"
									value={loginEmail}
									onChange={setLoginEmail}
									onKeyPress={handleKeyPress}
									className={loginErrorMessage ? 'input_error' : ''}
								/>
					<Input
						srcImage="/icons-lock.svg"
						extImage="/icons-eye-off.svg"
						inputName="Senha"
						placeholder="Senha"
						type="password"
						name="login_password"
						value={loginPassword}
						onChange={setLoginPassword}
						onKeyPress={handleKeyPress}
						className={loginErrorMessage ? 'input_error' : ''}
					/>
				</div>

				{loginErrorMessage && <p className="error_message">{loginErrorMessage}</p>}

				<div className="login_opt">
					<div className="remember_me">
						<input type="checkbox" name="remember" id="remember_me" />
						<label htmlFor="remember_me" title="Lembre-se de mim">
							Lembre-se de mim
						</label>
					</div>
					<div>
						<Link href={'/'} className="forgot_password" title="Esqueceu sua senha?">
							Esqueceu sua senha?
						</Link>
					</div>
				</div>

				<div className="divider">
					<div></div>
					<p>Or login with</p>
					<div></div>
				</div>

				<div className="container_google_box">
					<button>
						<img src="/icons-google.svg" alt="google icon" />
						<p>Google</p>
					</button>
				</div>

				<div className="login_btn">
					<button onClick={handleLogin} disabled={isLoading || (loginEmail && loginPassword) ? false : true} title="Login">
						{isLoading ? <div className="spinner"></div> : 'Login'}
					</button>
				</div>
			</div>
			<div className={`card_register ${activeTab === 'register' ? 'form_active' : ''}`}>
				<div className={`card_questions ${step === 0 && activeTab === 'register' ? 'step_active' : 'step_inactive'}`}>
					<div className="question_section">
						<h2 className="question_title">Qual dessas opções melhor descreve você?</h2>

						<div className="options_container">
							<div
								className={`option_card ${selectedOption === 'responsavel' ? 'selected' : ''}`}
								onClick={() => setSelectedOption('responsavel')}>
								<div className="option_content">
									<h3>Responsável</h3>
									<p>Se você é pai, mãe ou responsável legal e deseja cadastrar uma criança, escolha esta opção.</p>
								</div>
								{selectedOption === 'responsavel' && (
									<div className="check_icon">
										<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
											<circle cx="12" cy="12" r="10" fill="#FF9800" />
											<path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</div>
								)}
							</div>

							<div className={`option_card ${selectedOption === 'ong' ? 'selected' : ''}`} onClick={() => setSelectedOption('ong')}>
								<div className="option_content">
									<h3>ONG / Instituição</h3>
									<p>Se você representa uma ONG, escola ou instituição que cuida de crianças, selecione esta opção.</p>
								</div>
								{selectedOption === 'ong' && (
									<div className="check_icon">
										<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
											<circle cx="12" cy="12" r="10" fill="#FF9800" />
											<path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{selectedOption === 'responsavel' && (
					<div className={`card_responsible ${step === 1 && activeTab === 'register' ? 'step_active' : 'step_inactive'}`}>
						<div className="questions_responsible">
							<div className="inputs">
								<Input
									srcImage="/icons-name.svg"
									inputName="Nome"
									placeholder="Nome"
									type="text"
									name="responsavel_nome"
									value={responsableName}
									onChange={setResponsableName}
								/>
								<Input
									srcImage="/icons-email.svg"
									inputName="Email"
									placeholder="usuario@exemplo.com"
									type="email"
									name="responsavel_email"
									mask="email"
									value={responsableRegisterEmail}
									onChange={setResponsableRegisterEmail}
								/>
								<Input
									srcImage="/icons-phone.svg"
									inputName="Telefone"
									placeholder="(11) 98765-4321"
									type="tel"
									name="responsavel_telefone"
									mask="phone"
									value={responsablePhone}
									onChange={setResponsablePhone}
								/>
								<Input
									srcImage="/icons-date.svg"
									inputName="Data"
									placeholder="Data"
									type="date"
									name="responsavel_data_nascimento"
									value={responsableDateOfBirth}
									onChange={setResponsableDateOfBirth}
								/>
								<Input
									srcImage="/icons-card.svg"
									inputName="CPF"
									placeholder="000.000.000-00"
									type="text"
									name="responsavel_cpf"
									mask="cpf"
									value={responsableCpf}
									onChange={setResponsableCpf}
								/>
								<Input
									srcImage="/icons-pin_orange.svg"
									inputName="CEP"
									placeholder="CEP (somente números)"
									type="text"
									name="responsavel_cep"
									value={responsableAddress}
									isLoading={isCepLoading}
									mask="cep"
									onChange={setResponsableAddress}
									onComplete={(cep) => consultarCEP(cep, false)}
								/>
								
								{responsableAddressVisible && (
									<>
										<Input
											srcImage="/icons-pin_orange.svg"
											inputName="Logradouro"
											placeholder="Logradouro"
											type="text"
											name="responsavel_logradouro"
											value={responsableLogradouro}
											readonly={true}
											onChange={() => {}} // Não faz nada pois é readonly
										/>
										<Input
											srcImage="/icons-pin_orange.svg"
											inputName="Bairro"
											placeholder="Bairro"
											type="text"
											name="responsavel_bairro"
											value={responsableBairro}
											readonly={true}
											onChange={() => {}} // Não faz nada pois é readonly
										/>
										<Input
											srcImage="/icons-pin_orange.svg"
											inputName="Cidade"
											placeholder="Cidade"
											type="text"
											name="responsavel_cidade"
											value={responsableCidade}
											readonly={true}
											onChange={() => {}} // Não faz nada pois é readonly
										/>
										<Input
											srcImage="/icons-pin_orange.svg"
											inputName="UF"
											placeholder="UF"
											type="text"
											name="responsavel_uf"
											value={responsableUf}
											readonly={true}
											onChange={() => {}} // Não faz nada pois é readonly
										/>
										<Input
											srcImage="/icons-pin_orange.svg"
											inputName="Número"
											placeholder="Número (opcional)"
											type="text"
											name="responsavel_numero"
											value={responsableNumero}
											onChange={setResponsableNumero}
										/>
										<Input
											srcImage="/icons-pin_orange.svg"
											inputName="Complemento"
											placeholder="Complemento (opcional)"
											type="text"
											name="responsavel_complemento"
											value={responsableComplemento}
											onChange={setResponsableComplemento}
										/>
									</>
								)}
								
								<Select
									srcImage="/icons-gender.svg"
									inputName="Gênero"
									placeholder="Selecione seu gênero"
									name="responsavel_genero"
									value={responsableGender}
									options={[]}
									onChange={setResponsableGender}
									onLoadOptions={loadGenderOptions}
								/>
								<Input
									srcImage="/icons-lock.svg"
									extImage="/icons-eye-off.svg"
									inputName="Senha"
									placeholder="Senha"
									type="password"
									name="responsavel_senha"
									value={responsableRegisterPassword}
									onChange={setResponsableRegisterPassword}
								/>
								<Input
									srcImage="/icons-lock.svg"
									extImage="/icons-eye-off.svg"
									inputName="Confirmar Senha"
									placeholder="Confirmar Senha"
									type="password"
									name="responsavel_confirmar_senha"
									value={confirmResponsablePassword}
									onChange={(value) => {
										setConfirmResponsablePassword(value)
										validatePasswords(responsableRegisterPassword, value, 'responsavel')
									}}
								/>
							</div>
						</div>
					</div>
				)}

				{selectedOption === 'crianca' && (
					<div className={`card_kid ${step === 1 && activeTab === 'register' ? 'step_active' : 'step_inactive'}`}>
						<div className="questions_kid">
							<div className="inputs">
								<Input srcImage="/icons-name.svg" inputName="Nome" placeholder="Nome" type="text" value={kidName} onChange={setKidName} />
								<Input
									srcImage="/icons-email.svg"
									inputName="Email"
									placeholder="Email"
									type="email"
									value={kidRegisterEmail}
									onChange={setKidRegisterEmail}
								/>
								<Input
									srcImage="/icons-phone.svg"
									inputName="Telefone"
									placeholder="Telefone"
									type="tel"
									value={kidPhone}
									onChange={setKidPhone}
								/>
								<Input
									srcImage="/icons-date.svg"
									inputName="Date"
									placeholder="Data"
									type="date"
									value={kidDateOfBirth}
									onChange={setKidDateOfBirth}
								/>
								<Input srcImage="/icons-card.svg" inputName="CPF" placeholder="CPF" type="text" value={kidCpf} onChange={setKidCpf} />
								<Input
									srcImage="/icons-card.svg"
									inputName="CPF do responsável"
									placeholder="CPF do responsável"
									type="text"
									value={kidCpfResponsable}
									onChange={setKidCpfResponsable}
								/>
								<Input
									srcImage="/icons-lock.svg"
									extImage="/icons-eye-off.svg"
									inputName="Senha"
									placeholder="Senha"
									type="password"
									value={kidRegisterPassword}
									onChange={setKidRegisterPassword}
								/>
								<Input
									srcImage="/icons-lock.svg"
									extImage="/icons-eye-off.svg"
									inputName="Confirmar senha"
									placeholder="Confirmar senha"
									type="password"
									value={confirmKidPassword}
									onChange={setConfirmKidPassword}
								/>
							</div>
						</div>
					</div>
				)}

				{selectedOption === 'ong' && (
					<div className={`card_ong ${step === 1 && activeTab === 'register' ? 'step_active' : 'step_inactive'}`}>
						<div className="questions_ong">
							<div className="inputs">
								<Input
									srcImage="/icons-name.svg"
									inputName="Nome"
									placeholder="Nome da instituição"
									type="text"
									name="ong_nome"
									value={ongName}
									onChange={setOngName}
								/>
								<Input
									srcImage="/icons-email.svg"
									inputName="Email"
									placeholder="instituicao@exemplo.com"
									type="email"
									name="ong_email"
									mask="email"
									value={ongRegisterEmail}
									onChange={setOngRegisterEmail}
								/>
								<Input
									srcImage="/icons-phone.svg"
									inputName="Telefone"
									placeholder="(11) 98765-4321"
									type="tel"
									name="ong_telefone"
									mask="phone"
									value={ongPhone}
									onChange={setOngPhone}
								/>
								<MultiSelect
									srcImage="/icons-ong.svg"
									inputName="Tipos de Instituição"
									placeholder="Selecione os tipos de instituição"
									selectedValues={ongTiposInstituicao}
									name="ong_tipos_instituicao"
									options={[]}
									onChange={setOngTiposInstituicao}
									onLoadOptions={loadInstitutionTypes}
								/>
								<Input srcImage="/icons-card.svg" inputName="CNPJ" placeholder="00.000.000/0000-00" type="text" name="ong_cnpj" mask="cnpj" value={ongCnpj} onChange={setOngCnpj} />
								<Input
									srcImage="/icons-pin_orange.svg"
									inputName="CEP"
									placeholder="CEP (somente números)"
									type="text"
									name="ong_cep"
									value={ongAdress}
									isLoading={ongCepLoading}
									mask="cep"
									onChange={setOngAdress}
									onComplete={(cep) => consultarCEP(cep, true)}
								/>
								
								{ongAddressVisible && (
									<>
										<Input
											srcImage="/icons-pin_orange.svg"
											inputName="Logradouro"
											placeholder="Logradouro"
											type="text"
											name="ong_logradouro"
											value={ongLogradouro}
											readonly={true}
											onChange={() => {}} // Não faz nada pois é readonly
										/>
										<Input
											srcImage="/icons-pin_orange.svg"
											inputName="Bairro"
											placeholder="Bairro"
											type="text"
											name="ong_bairro"
											value={ongBairro}
											readonly={true}
											onChange={() => {}} // Não faz nada pois é readonly
										/>
										<Input
											srcImage="/icons-pin_orange.svg"
											inputName="Cidade"
											placeholder="Cidade"
											type="text"
											name="ong_cidade"
											value={ongCidade}
											readonly={true}
											onChange={() => {}} // Não faz nada pois é readonly
										/>
										<Input
											srcImage="/icons-pin_orange.svg"
											inputName="UF"
											placeholder="UF"
											type="text"
											name="ong_uf"
											value={ongUf}
											readonly={true}
											onChange={() => {}} // Não faz nada pois é readonly
										/>
										<Input
											srcImage="/icons-pin_orange.svg"
											inputName="Número"
											placeholder="Número (opcional)"
											type="text"
											name="ong_numero"
											value={ongNumero}
											onChange={setOngNumero}
										/>
										<Input
											srcImage="/icons-pin_orange.svg"
											inputName="Complemento"
											placeholder="Complemento (opcional)"
											type="text"
											name="ong_complemento"
											value={ongComplemento}
											onChange={setOngComplemento}
										/>
									</>
								)}
								
								<Input
									srcImage="/icons-lock.svg"
									extImage="/icons-eye-off.svg"
									inputName="Senha"
									placeholder="Senha"
									type="password"
									name="ong_senha"
									value={ongRegisterPassword}
									onChange={setOngRegisterPassword}
								/>
								<Input
									srcImage="/icons-lock.svg"
									extImage="/icons-eye-off.svg"
									inputName="Confirmar Senha"
									placeholder="Confirmar Senha"
									type="password"
									name="ong_confirmar_senha"
									value={confirmOngPassword}
									onChange={(value) => {
										setConfirmOngPassword(value)
										validatePasswords(ongRegisterPassword, value, 'ong')
									}}
								/>
							</div>
						</div>
					</div>
				)}

				{registerErrorMessage && activeTab === 'register' && (
					<p className="error_message">{registerErrorMessage}</p>
				)}

				<div className={`navigation_buttons`}>
					<button
						className="btn_back"
						onClick={handleBack}
						disabled={!canGoBack}
						aria-disabled={!canGoBack}
						title={canGoBack ? 'Voltar' : ''}>
						← Voltar
					</button>
					<button 
						className="btn_next" 
						onClick={handleNext} 
						disabled={isLoading} 
						title={step === 1 ? "Cadastrar" : "Avançar"}>
						{isLoading ? <div className="spinner"></div> : (step === 1 ? "Cadastrar" : "Avançar →")}
					</button>
				</div>
			</div>
		</div>
	)
}
