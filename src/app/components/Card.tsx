import Input from './Input'
import SwitchButtons from './Switch'
import Link from 'next/link'
import { useState } from 'react'

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
	const [kidCpfResponsable, setKidCpfResponsable] = useState<string>('')
	const [responsableAddress, setResponsableAddress] = useState<string>('')
	const [selectedOption, setSelectedOption] = useState<string>('responsavel')
	const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
	const [step, setStep] = useState<number>(0)
	const canGoBack = step > 0

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

	const handleSubmit = () => {
		console.log('Email:', loginEmail)
		console.log('Senha:', loginPassword)
	}

	return (
		<div className="card_container">
			<SwitchButtons activeTab={activeTab} setActiveTab={setActiveTab} />
			<div className={`card_login ${activeTab === 'login' ? 'form_active' : ''}`}>
				<div className="inputs">
					<Input
						srcImage="/icons-email.svg"
						inputName="Email"
						placeholder="exemplo123@gmail.com"
						type="email"
						value={loginEmail}
						onChange={setLoginEmail}
					/>
					<Input
						srcImage="/icons-lock.svg"
						extImage="/icons-eye-off.svg"
						inputName="Senha"
						placeholder="**********"
						type="password"
						value={loginPassword}
						onChange={setLoginPassword}
					/>
				</div>

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
					<button onClick={handleSubmit}>Login</button>
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

							<div className={`option_card ${selectedOption === 'crianca' ? 'selected' : ''}`} onClick={() => setSelectedOption('crianca')}>
								<div className="option_content">
									<h3>Criança</h3>
									<p>Se você é uma criança ou adolescente e está sendo cadastrado por um responsável, esta é a sua opção.</p>
								</div>
								{selectedOption === 'crianca' && (
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
									placeholder="Lucas Ribeiro"
									type="text"
									value={responsableName}
									onChange={setResponsableName}
								/>
								<Input
									srcImage="/icons-email.svg"
									inputName="Email"
									placeholder="exemplo123@gmail.com"
									type="email"
									value={responsableRegisterEmail}
									onChange={setResponsableRegisterEmail}
								/>
								<Input
									srcImage="/icons-phone.svg"
									inputName="Telefone"
									placeholder="(11) 99999-9999"
									type="tel"
									value={responsablePhone}
									onChange={setResponsablePhone}
								/>
								<Input
									srcImage="/icons-date.svg"
									inputName="Telefone"
									placeholder="(11) 99999-9999"
									type="date"
									value={responsableDateOfBirth}
									onChange={setResponsableDateOfBirth}
								/>
								<Input
									srcImage="/icons-card.svg"
									inputName="CPF"
									placeholder="000.000.000-00"
									type="text"
									value={responsableCpf}
									onChange={setResponsableCpf}
								/>
								<Input
									srcImage="/icons-pin_orange.svg"
									inputName="CEP"
									placeholder="01001-000"
									type="text"
									value={responsableAddress}
									onChange={setResponsableAddress}
								/>
								<Input
									srcImage="/icons-lock.svg"
									extImage="/icons-eye-off.svg"
									inputName="Senha"
									placeholder="Senha"
									type="password"
									value={responsableRegisterPassword}
									onChange={setResponsableRegisterPassword}
								/>
								<Input
									srcImage="/icons-lock.svg"
									extImage="/icons-eye-off.svg"
									inputName="Confirmar senha"
									placeholder="Confirmar senha"
									type="password"
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
								<Input
									srcImage="/icons-name.svg"
									inputName="Nome"
									placeholder="Lucas Ribeiro"
									type="text"
									value={kidName}
									onChange={setKidName}
								/>
								<Input
									srcImage="/icons-email.svg"
									inputName="Email"
									placeholder="exemplo123@gmail.com"
									type="email"
									value={kidRegisterEmail}
									onChange={setKidRegisterEmail}
								/>
								<Input
									srcImage="/icons-phone.svg"
									inputName="Telefone"
									placeholder="(11) 99999-9999"
									type="tel"
									value={kidPhone}
									onChange={setKidPhone}
								/>
								<Input
									srcImage="/icons-date.svg"
									inputName="Telefone"
									placeholder="(11) 99999-9999"
									type="date"
									value={kidDateOfBirth}
									onChange={setKidDateOfBirth}
								/>
								<Input
									srcImage="/icons-card.svg"
									inputName="CPF"
									placeholder="000.000.000-00"
									type="text"
									value={kidCpf}
									onChange={setKidCpf}
								/>
								<Input
									srcImage="/icons-card.svg"
									inputName="CPF do responsável"
									placeholder="000.000.000-00"
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
									value={responsableName}
									onChange={setResponsableName}
								/>
								<Input
									srcImage="/icons-email.svg"
									inputName="Email"
									placeholder="exemplo123@gmail.com"
									type="email"
									value={responsableRegisterEmail}
									onChange={setResponsableRegisterEmail}
								/>
								<Input
									srcImage="/icons-phone.svg"
									inputName="Telefone"
									placeholder="(11) 99999-9999"
									type="tel"
									value={responsablePhone}
									onChange={setResponsablePhone}
								/>
								<Input
									srcImage="/icons-date.svg"
									inputName="Telefone"
									placeholder="(11) 99999-9999"
									type="date"
									value={responsableDateOfBirth}
									onChange={setResponsableDateOfBirth}
								/>
								<Input
									srcImage="/icons-card.svg"
									inputName="CPF"
									placeholder="000.000.000-00"
									type="text"
									value={responsableCpf}
									onChange={setResponsableCpf}
								/>
								<Input
									srcImage="/icons-pin_orange.svg"
									inputName="CEP"
									placeholder="01001-000"
									type="text"
									value={responsableAddress}
									onChange={setResponsableAddress}
								/>
								<Input
									srcImage="/icons-lock.svg"
									extImage="/icons-eye-off.svg"
									inputName="Senha"
									placeholder="Senha"
									type="password"
									value={responsableRegisterPassword}
									onChange={setResponsableRegisterPassword}
								/>
								<Input
									srcImage="/icons-lock.svg"
									extImage="/icons-eye-off.svg"
									inputName="Confirmar senha"
									placeholder="Confirmar senha"
									type="password"
									value={confirmResponsablePassword}
									onChange={setConfirmResponsablePassword}
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
