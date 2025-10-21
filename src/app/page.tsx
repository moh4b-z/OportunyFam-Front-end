import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ marginBottom: '20px', fontSize: '2rem' }}>
        Bem-vindo ao OportunyFam
      </h1>
      <p style={{ marginBottom: '30px', fontSize: '1.2rem', color: '#666' }}>
        Conectando famílias e oportunidades
      </p>
      <Link 
        href="/login" 
        style={{
          backgroundColor: '#f6a623',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '1.1rem',
          fontWeight: '500'
        }}
      >
        Fazer Login
      </Link>
    </div>
  )
}