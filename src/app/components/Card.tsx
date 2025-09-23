import Input from './Input'
import { useState } from 'react'

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
				<p>Login</p>
				<p>Registre-se</p>
			</div>

			<div className="inputs">
				<Input srcImage="/icons-email.svg" inputName="Email" type="email" value={email} onChange={setEmail} />
				<Input srcImage="/icons-lock.svg" inputName="Senha" type="password" value={senha} onChange={setSenha} />
			</div>

			<div className="navigation_buttons">
				<button onClick={handleSubmit}>Entrar</button>
			</div>
		</div>
	)
}
