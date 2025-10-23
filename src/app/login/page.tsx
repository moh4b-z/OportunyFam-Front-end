'use client'

import { useState } from 'react'
import Image from 'next/image'
import CardSystem from '@components/Card'
import TestCredentials from '@/components/TestCredentials'

export default function LoginPage() {
	const [currentTab, setCurrentTab] = useState<'login' | 'register'>('login')

	const handleTabChange = (tab: 'login' | 'register') => {
		setCurrentTab(tab)
	}

	return (
		<main>
			<TestCredentials />
			<div className="background_image">
				<Image src="/img/pres_image-1.png" alt="pres_image-1" fill className="pres_image" id="pres_image-1" quality={100} />
			</div>
			<div className="container_form">
				<div className="text_presentation">
					{currentTab === 'login' ? (
						<>
							<h1>Seja bem-vindo novamente!</h1>
							<h2>Entre em sua conta para usar os nossos serviços</h2>
						</>
					) : (
						<>
							<h1>Crie sua conta e junte-se a nós</h1>
							<h2>Estamos felizes em ter você por aqui</h2>
						</>
					)}
				</div>
				<CardSystem onTabChange={handleTabChange} />
			</div>
		</main>
	)
}

// // índice do ícone ativo (null = nenhum)
// const [activeIcon, setActiveIcon] = useState<number | null>(null);
// // modal (continua do seu exemplo)
// const [showModal, setShowModal] = useState<boolean>(true);

// const icons = ['/icons-notif.svg', 'icons-chat.svg', 'icons-pin.svg', 'icons-people.svg'];

// return (
//   <>
//     {/* O conteúdo que recebe o blur */}
//     <div className={showModal ? "app-root blurred" : "app-root"}>
//       {/* Sidebar amarela fixa à esquerda */}
//       <aside className="sidebar">
//         {/* QUADRADO VERMELHO -> LOGO */}
//         <div className="logo-box">
//           {/* substitua a imagem em public/logo.png */}
//           <img src="/logo-branca.png" alt="Logo" className="logo-img" />
//         </div>

//         {/* RETÂNGULO ROXO -> painel de ícones */}  //         <div className="icon-panel">
//           {icons.map((ic, i) => (
//             <button
//               key={i}
//               className={`icon-btn ${activeIcon === i ? "active" : ""}`}
//               onClick={() => setActiveIcon(i)}
//               aria-label={`Ícone ${i}`}
//               title={`Ícone ${i}`}
//             >
//               <img src={ic} alt={`Ícone ${i}`} className="icon-symbol" />
//             </button>
//           ))}
//         </div>
//       </aside>

//       {/* Main area do mapa */}
//       <main className="map-area">
//         {/* Search bar (movida um pouco para a esquerda) */}
//         <div className="search-box">
//           <input className="search-input" placeholder="Pesquise aqui" />
//           <button className="search-btn">🔎</button>
//         </div>

//         {/* Chips / filtros (movidos para a esquerda) */}
//         <div className="chips">
//           <span className="chip">Jiu Jitsu</span>
//           <span className="chip">T.I</span>
//           <span className="chip">Centro Cultural</span>
//           <span className="chip">Biblioteca</span>
//         </div>

//         {/* Foto de perfil no canto direito (com bolinha vermelha) */}
//         <div className="profile-wrapper">
//           <img src="/profile.png" alt="Perfil" className="profile-img" />
//           <div className="notif-dot" />
//         </div>

//         {/* Mapa (fundo) */}
//         <div className="map" role="img" aria-label="Mapa de fundo" />
//       </main>
//     </div>

//     {/* Modal (igual ao anterior) */}
//     {showModal && (
//       <div className="modal-overlay" role="dialog" aria-modal="true">
//         <div className="modal-card">
//           <button
//             className="modal-exit"
//             onClick={() => setShowModal(false)}
//             aria-label="Fechar"
//           >
//             ✕
//           </button>

//           <h1 className="modal-title">
//             Olá, Seja Bem Vindo a OportunityFam!
//           </h1>
//           <hr className="modal-hr" />

//           <p className="modal-text">
//             Aqui você vai encontrar as melhores instituições para o seu filho.
//           </p>

//           <p className="modal-question">Deseja cadastrar seu filho agora?</p>

//           <div className="modal-actions">
//             <button className="btn btn-outline">Não</button>
//             <button className="btn btn-primary">Sim</button>
//           </div>
//         </div>
//       </div>
//     )}
//   </>
// );
