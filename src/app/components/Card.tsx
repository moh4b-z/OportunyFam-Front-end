import Input from './Input'
import Select from './Select'
import SwitchButtons from './Switch'
import Link from 'next/link'
import { useState } from 'react'
import { loginUser } from '@/services/authService'

export default function CardSystem() {
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
	const [selectedOption, setSelectedOption] = useState<string>('responsavel')
	const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
	const [step, setStep] = useState<number>(0)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string | false>(false)
	const [isCepLoading, setIsCepLoading] = useState<boolean>(false)
	const [ongCepLoading, setOngCepLoading] = useState<boolean>(false)
	const canGoBack = step > 0

	// Função para carregar opções de gênero da API
	const loadGenderOptions = async () => {
		try {
			const response = await fetch('http://localhost:3030/v1/oportunyfam/sexos')
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
					console.log('Formato de resposta da API:', data)
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
		
		try {
			const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
			
			if (!response.ok) {
				throw new Error('Erro ao consultar CEP')
			}
			
			const data = await response.json()
			
			// Verifica se o CEP é válido (ViaCEP retorna erro: true para CEPs inválidos)
			if (data.erro) {
				console.log('CEP não encontrado')
				return
			}
			
			// Mostra o resultado no console
			console.log('Dados do CEP:', {
				cep: data.cep,
				logradouro: data.logradouro,
				complemento: data.complemento,
				bairro: data.bairro,
				localidade: data.localidade,
				uf: data.uf,
				ibge: data.ibge,
				gia: data.gia,
				ddd: data.ddd,
				siafi: data.siafi
			})

			// Preenche os campos de endereço baseado no tipo (responsável ou ONG)
			if (isOng) {
				setOngLogradouro(data.logradouro || '')
				setOngBairro(data.bairro || '')
				setOngCidade(data.localidade || '')
				setOngUf(data.uf || '')
				setOngAddressVisible(true)
			} else {
				setResponsableLogradouro(data.logradouro || '')
				setResponsableBairro(data.bairro || '')
				setResponsableCidade(data.localidade || '')
				setResponsableUf(data.uf || '')
				setResponsableAddressVisible(true)
			}
			
		} catch (error) {
			console.error('Erro ao consultar CEP:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleNext = () => {
		if (!selectedOption) {
			alert('Por favor, selecione uma opção antes de continuar.')
			return
		}
		setStep(step + 1)
		return
	}

	const handleBack = () => {
		if (!canGoBack) return
		setStep(step - 1)
	}

	const handleLogin = async () => {
		setIsLoading(true)
		setErrorMessage(false)

		try {
			const response = await loginUser(loginEmail, loginPassword)
			const data = await response?.json()

			if (response?.ok && data.status) {
			} else if (response?.status === 415) {
				//O status code vai mudar depois que o back arrumar(401)
				setErrorMessage('Email ou senha incorretos. Por favor, tente novamente.')
			}
		} catch (error) {
			setErrorMessage('Algo deu errado. Por favor, tente novamente mais tarde.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="card_container">
			<SwitchButtons activeTab={activeTab} setActiveTab={setActiveTab} />
			<div className={`card_login ${activeTab === 'login' ? 'form_active' : ''}`}>
				<div className="inputs">
					<Input
						srcImage="/icons-email.svg"
						inputName="Email"
						placeholder="Email"
						type="email"
						name="login_email"
						value={loginEmail}
						onChange={setLoginEmail}
						className={errorMessage ? 'input_error' : ''}
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
						className={errorMessage ? 'input_error' : ''}
					/>
				</div>

				{errorMessage && <p className="error_message">{errorMessage}</p>}

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
									placeholder="Email"
									type="email"
									name="responsavel_email"
									value={responsableRegisterEmail}
									onChange={setResponsableRegisterEmail}
								/>
								<Input
									srcImage="/icons-phone.svg"
									inputName="Telefone"
									placeholder="Telefone"
									type="tel"
									name="responsavel_telefone"
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
									placeholder="CPF"
									type="text"
									name="responsavel_cpf"
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
									inputName="Confirmar senha"
									placeholder="Confirmar senha"
									type="password"
									name="responsavel_confirmar_senha"
									value={confirmResponsablePassword}
									onChange={setConfirmResponsablePassword}
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
									placeholder="Email"
									type="email"
									name="ong_email"
									value={ongRegisterEmail}
									onChange={setOngRegisterEmail}
								/>
								<Input
									srcImage="/icons-phone.svg"
									inputName="Telefone"
									placeholder="Telefone"
									type="tel"
									name="ong_telefone"
									value={ongPhone}
									onChange={setOngPhone}
								/>
								{/* <select name="ong_name" id="1">
									<option value="valor1">Opção 1</option>
									<option value="valor2">Opção 2</option>
									<option value="valor3" selected>
										Opção 3 (Pré-selecionada)
									</option>
								</select> */}
								<Input srcImage="/icons-card.svg" inputName="CNPJ" placeholder="CNPJ" type="text" name="ong_cnpj" value={ongCnpj} onChange={setOngCnpj} />
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
									inputName="Confirmar senha"
									placeholder="Confirmar senha"
									type="password"
									name="ong_confirmar_senha"
									value={confirmOngPassword}
									onChange={setConfirmOngPassword}
								/>
							</div>
						</div>
					</div>
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
					<button className="btn_next" onClick={handleNext} title="Avançar">
						Avançar →
					</button>
				</div>
			</div>
		</div>
	)
}
