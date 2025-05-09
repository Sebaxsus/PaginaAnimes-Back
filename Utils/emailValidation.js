// Web Page where i got the data of email domains https://email-verify.my-addr.com/list-of-most-popular-email-domains.php

export function isValidEmail(email) {
    
    /*
        Desgloce regex,

        Se utiliza el flag v de ECMAScript regex | v -> vnicode (Enable all unicode and character set features)

        Se valida primero que empiece por (Letras, Numeros o _) -> [\w]+

        Se valida que despues de todas las letras iniciales siga el caracter/Simbolo @ -> [\@]

        se valida que despues del simbolo siga alguno de los domios gmail|hotmail|yahoo|outlook -> (gmail|hotmail|yahoo|outlook)

        se valida que despues sigua por el caracter/simbolo "." -> \.

        se valida que despues del "." contega tres caracters (Letras) -> [a-zA-Z]{3}
    */
    const emailRegex = /^[\w]+[\@](gmail|hotmail|yahoo|outlook)\.([a-zA-Z]{3})$/v


    // Si devuelve true el email hizo match con el regex
    // Si devuelve false el email no hizo match con el regex y por ende no es un email valido
    return emailRegex.test(email)
}