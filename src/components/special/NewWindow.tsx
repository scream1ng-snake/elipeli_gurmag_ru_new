import { FC, useEffect, useState } from "react";
import { WithChildren } from "../../features/helpers";
import ReactDOM from 'react-dom/client';

export const NewWindow: FC<WithChildren & { show: boolean }> = ({ children, show }) => {
  const [newWindow, setNewWindow] = useState<Window | null>(null)
  useEffect(() => {
    if (!show) {
      newWindow?.close()
      return
    }
    if (!newWindow) setNewWindow(window.open("", "newWindow", "width=600,height=400"))
    if (newWindow) {
      newWindow.document.write(`  
        <!DOCTYPE html>  
        <html>  
        <head>  
          <title>New Window</title>
        </head>  
        <body>  
            <div id="root"></div>  
        </body>  
        </html>  
      `);

      newWindow.document.close()

      const entry = ReactDOM.createRoot(
        newWindow.document.getElementById('root') as HTMLElement
      );
      entry.render(children)
    }
    return () => newWindow?.close()
  }, [newWindow, show])

  return <div>

  </div>
}

export function showPaymentInNewWindow(
  confirmation_token: string,
  functions: {
    onSuccess: () => void,
    onFail: () => void,
    error_callback: () => void
  }
) {
  const newWindow = window.open("", "_blank");

  if (newWindow) {
    newWindow.focus()
    // Используйте HTML для создания контейнера для компонента  
    newWindow.document.write(`  
      <!DOCTYPE html>  
      <html>
      <head>  
          <title>Оплата</title>
          <script defer>
            const script = document.createElement('script');  
            script.src = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js';  
            document.head.appendChild(script); 
            script.onload = () => {  
              let checkoutWidget = new window.YooMoneyCheckoutWidget({
                confirmation_token: "${confirmation_token}",
                customization: {
                  modal: true
                },
                error_callback: function (error) {
                  console.error(error)
                  checkoutWidget.destroy()
                  if (window.opener) {  
                  window.opener.postMessage('error_callback', '${window.origin}');  
                  }
                  window.close()
                }
              })
              checkoutWidget.on("success", () => {
                checkoutWidget.destroy()
                if (window.opener) {  
                  window.opener.postMessage('onSuccess', '${window.origin}');  
                }
                window.close()
              })
              checkoutWidget.on("fail", (err) => {
                checkoutWidget.destroy()
                console.error(err)
                if (window.opener) {  
                  window.opener.postMessage('onFail', '${window.origin}');  
                }
                window.close()
              })
              checkoutWidget.render('payment-form')
            };  
          </script>
      </head>  
      <body>  
          <div id="payment-form"></div>  
      </body>  
      </html>  
      `);

    newWindow.document.close()
    
    
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {  
        return;  
      }
      if(Object.keys(functions).includes(event.data)) {
        functions[event.data as keyof typeof functions]()
      } else {
        functions.onFail()
      }
      window.removeEventListener('message', handleMessage)
    }
    window.addEventListener('message', handleMessage)
  }
}