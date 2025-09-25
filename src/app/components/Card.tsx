import Input from './Input'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function CardLogin() {
	const [email, setEmail] = useState('')
	const [senha, setSenha] = useState('')

	const handleSubmit = () => {
		console.log('Email:', email)
		console.log('Senha:', senha)
	}

	return (
		<div className="card_container">
			<div className="switch_buttons">
				<div className="switch_login">
					<p>Login</p>
				</div>
				<div className="switch_register">
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
					extImage="/icons-eye.svg"
					extImageName="eye"
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
					<label htmlFor="remember_me">Lembre-se de mim</label>
				</div>
				<div>
					<Link href={'/'} className="forgot_password">
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
