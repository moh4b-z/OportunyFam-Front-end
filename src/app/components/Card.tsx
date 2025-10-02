import Input from './Input'
import Link from 'next/link'
import { useState } from 'react'

export function CardLogin() {
	const [email, setEmail] = useState('')
	const [senha, setSenha] = useState('')
	const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

	const handleSubmit = () => {
		console.log('Email:', email)
		console.log('Senha:', senha)
	}

	return (
		<div className="card_container">
			<div className="switch_buttons">
				<div className={`switch_highlight ${activeTab}`}></div>
				<div className="switch_login" title="Faça login">
					<p>Login</p>
				</div>
				<div className="switch_register" title="Registre-se">
					<p>Registre-se</p>
				</div>
			</div>

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
					extImageName="eye-off"
					inputName="Senha"
					placeholder="**********"
					type="password"
					value={senha}
					onChange={setSenha}
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
	)
}

export default function CardQuestions() {
	const [selectedOption, setSelectedOption] = useState('responsavel')

	return (
		<div className="card_container">
			<div className="switch_buttons">
				<div className="switch_login" title="Faça login">
					<p>Login</p>
				</div>
				<div className="switch_register active" title="Registre-se">
					<p>Registre-se</p>
				</div>
			</div>

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

			<div className="navigation_buttons">
				<button className="btn_back">← Voltar</button>
				<button className="btn_next">Avançar →</button>
			</div>
		</div>
	)
}
