import { useState } from 'react'

type ContainerProps = {
	activeTab: 'login' | 'register'
	setActiveTab: (tab: 'login' | 'register') => void
}

export default function SwitchButtons({ activeTab, setActiveTab }: ContainerProps) {
	return (
		<div className="switch_buttons">
			<div className={`switch_highlight ${activeTab}`}></div>
			<div className={`switch_login ${activeTab === 'login' ? 'active' : ''}`} title="Faça login" onClick={() => setActiveTab('login')}>
				<p>Login</p>
			</div>
			<div
				className={`switch_register ${activeTab === 'register' ? 'active' : ''}`}
				title="Registre-se"
				onClick={() => setActiveTab('register')}>
				<p>Registre-se</p>
			</div>
		</div>
	)
}
