import Link from 'next/link';
import React from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';

export default function FourOhFour() {
	const FourOhFourPage = styled.div`
    background: var(--bg-color-light-theme);
        .container {
            font-family: sans-serif;
            height: 80vh;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            img {
                margin-bottom: 5px;
            }
            h1 {
                font-weight: bold;
                font-size: 20px;
                .message {
                    font-weight: normal
                }
            }
        }
        `;
	return <>
		<FourOhFourPage>
			<div className='container'>
				<img src="/images/lotus-logo-small.png" alt="lotus" />
				<h1>404 | <span className='message'>{intl.get('general.404')}</span></h1>
				<Link href="/">
					<a>
						{intl.get('general.goBackToHome')}
					</a>
				</Link>
			</div>
		</FourOhFourPage>
	</>
}