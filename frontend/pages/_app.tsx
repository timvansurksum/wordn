import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

function App({ Component, pageProps }: AppProps) {
    return (
        <>
          <Head>
            <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-XWBGLHF4DQ"
            />

            <script
            dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-XWBGLHF4DQ', { page_path: window.location.pathname });
                `,
            }}
            />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
          </Head>
          <Component {...pageProps} />
        </>
      )
}

export default App
