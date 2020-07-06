import { GoogleSpreadsheet } from 'google-spreadsheet'
import moment from 'moment'

const doc = new GoogleSpreadsheet(process.env.SHEET_DOC_ID)

const genCupom = () => {
    const code = parseInt(moment().format('YYMMDDHHmmssSSS')).toString(16).toUpperCase()
    return code.substr(0, 4) + '-' + code.substr(4, 4) + '-' + code.substr(8, 4)
}

export default async (req, res) => {
    try {
        await doc.useServiceAccountAuth({
            client_email: process.env.SHEET_CLIENT_EMAIL,
            private_key: process.env.SHEET_PRIVATE_KEY
        })
        await doc.loadInfo()

        const sheet = doc.sheetsByIndex[1]
        const data = JSON.parse(req.body)

        const sheetConfig = doc.sheetsByIndex[2]
        await sheetConfig.loadCells('A3:B3')

        const mostrarPromocaoCell = sheetConfig.getCell(2, 0)
        const mostrarMensagemPromocao = sheetConfig.getCell(2, 1)

        let Cupom = ''
        let Promo = ''

        if (mostrarPromocaoCell.value === 'VERDADEIRO') {
            Cupom = genCupom()
            Promo = mostrarMensagemPromocao.value
        }

        //Nome	Email	WhatsApp	Cupom	Promo
        await sheet.addRow({
            Nome: data.Nome,
            'E-mail': data.Email,
            WhatsApp: data.WhatsApp,
            Cupom,
            Promo,
            Nota: parseInt(data.Nota),
            'Data Preenchimento': moment().format('DD/MM/YYYY, HH:mm:ss')

        })
        res.end(JSON.stringify({
            showCoupon: Cupom !== '',
            Cupom,
            Promo
        }))

    } catch (error) {
        console.log(error)
        res.end('Erro')
    }
}