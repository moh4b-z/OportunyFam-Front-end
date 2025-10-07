import Input from './Input'
import SwitchButtons from './Switch'
import Link from 'next/link'
import { useState } from 'react'

export default function CardSystem() {
	const [email, setEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [name, setName] = useState<string>('')
	const [phone, setPhone] = useState<string>('')
	const [dateOfBirth, setDateOfBirth] = useState<string>('')
	const [selectedOption, setSelectedOption] = useState('responsavel')
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
		console.log('Email:', email)
		console.log('Senha:', password)
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
						value={email}
						onChange={setEmail}
					/>
					<Input
						srcImage="/icons-lock.svg"
						extImage="/icons-eye-off.svg"
						inputName="Senha"
						placeholder="**********"
						type="password"
						value={password}
						onChange={setPassword}
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
									value={name}
									onChange={setName}
								/>
								<Input
									srcImage="/icons-email.svg"
									inputName="Email"
									placeholder="exemplo123@gmail.com"
									type="email"
									value={email}
									onChange={setEmail}
								/>
								<Input
									srcImage="/icons-phone.svg"
									inputName="Telefone"
									placeholder="(11) 99999-9999"
									type="tel"
									value={phone}
									onChange={setPhone}
								/>
								<Input
									srcImage="/icons-date.svg"
									inputName="Telefone"
									placeholder="(11) 99999-9999"
									type="date"
									value={dateOfBirth}
									onChange={setDateOfBirth}
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
