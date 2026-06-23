import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const search = url.searchParams.toString();
  const redirectTo = search ? `/app/templates?${search}` : '/app/templates';
  throw redirect(redirectTo);
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGlow} />
      
      <div className={styles.contentWrapper}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8L9 13H15L12 18V8Z" fill="white"/>
              </svg>
            </div>
            <div className={styles.logoText}>
              Feature<br/>Highlight<br/>Section
            </div>
          </div>
          
          <a href="/auth/login" className={styles.signInBtn}>
            Sign In
          </a>
        </header>

        <main className={styles.hero}>
          <div className={styles.badge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ color: '#95BF47' }}>
              <path d="M21.2 16.5c-.3 1.3-1.6 3.6-3.8 5.4-2.1 1.7-4.4 2.1-5.4 2.1s-3.3-.4-5.4-2.1c-2.2-1.8-3.5-4.1-3.8-5.4-.3-1.3-.2-2.3 0-3.3.1-.3.2-.6.4-1 .3-.6.6-1.1 1.6-1.6.4-.5 1-.9 1.5-1.2.6-.3 1.3-.5 2-.6.7-.1 1.5 0 2.2.2.8.2 1.6.6 2.4 1 1 .6 2 1.3 3 2.1 1-.8 2-1.5 3-2.1.8-.4 1.6-.8 2.4-1 .7-.2 1.5-.3 2.2-.2.7.1 1.4.3 2 .6.5.3 1.1.7 1.5 1.2.5.5.8 1 1.1 1.6.2.4.3.7.4 1 .2 1 .3 2 0 3.3zM12 4.1c-.8-.4-1.7-.7-2.6-.8-.9-.1-1.8 0-2.7.2C5.8 3.8 5 4.3 4.2 5c-.7.6-1.3 1.3-1.8 2-.5.8-.8 1.6-1 2.5-.2.9-.2 1.8 0 2.7.2.9.6 1.8 1.1 2.6.5.8 1.2 1.5 2 2.1.8.6 1.7 1.1 2.7 1.4 1 .3 2 .4 3 .3.9-.1 1.8-.3 2.7-.7 1-.4 1.8-.9 2.6-1.5 1.6 1.1 3.4 1.8 5.3 1.8h.2c1.9 0 3.7-.7 5.3-1.8.8.6 1.6 1.1 2.6 1.5.9.4 1.8.6 2.7.7 1 .1 2 0 3-.3 1-.3 1.9-.8 2.7-1.4.8-.6 1.5-1.3 2-2.1.5-.8.9-1.7 1.1-2.6.2-.9.2-1.8 0-2.7-.2-.9-.5-1.7-1-2.5-.5-.7-1.1-1.4-1.8-2-.8-.7-1.6-1.2-2.5-1.5-.9-.2-1.8-.3-2.7-.2-.9.1-1.8.4-2.6.8C16.2 2.5 14.2 1.6 12 1.6v2.5z"/>
            </svg>
            <span className={styles.badgeText}>Shopify Feature Highlight App</span>
          </div>

          <h1 className={styles.title}>
            Create Beautiful<br/>
            Feature Highlights<br/>
            <span className={styles.gradientText}>That Increase Trust<br/>& Conversions</span>
          </h1>

          <p className={styles.subtitle}>
            Build trust with premium feature highlight sections<br/>
            and boost your store sales without coding.
          </p>

          {showForm && (
            <Form method="post" action="/auth/login">
              <div className={styles.inputRow}>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  <input 
                    className={styles.input} 
                    type="text" 
                    name="shop" 
                    placeholder="your-store.myshopify.com" 
                    required 
                  />
                </div>
                <button className={styles.submitBtn} type="submit">
                  Install App 
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </Form>
          )}

          <div className={styles.security}>
            <svg className={styles.securityIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="M9 12l2 2 4-4"></path>
            </svg>
            Secure. No installation required.
          </div>
        </main>
      </div>

      <div className={styles.featureStrip}>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Easy to Use</h3>
            <p className={styles.featureDesc}>Create stunning feature sections in minutes</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>No Coding Required</h3>
            <p className={styles.featureDesc}>Powerful features without any technical skills</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Trusted by Stores</h3>
            <p className={styles.featureDesc}>Built for performance and designed to convert</p>
          </div>
        </div>
      </div>
    </div>
  );
}
