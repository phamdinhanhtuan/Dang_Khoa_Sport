const crypto = require('crypto');

class PaymentService {
    constructor() {
        this.momoConfig = {
            partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO_MOCK_123',
            accessKey: process.env.MOMO_ACCESS_KEY || 'MOCK_ACCESS',
            secretKey: process.env.MOMO_SECRET_KEY || 'MOCK_SECRET',
            endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create'
        };

        this.vnpayConfig = {
            tmnCode: process.env.VNPAY_TMN_CODE || 'VNPAY_MOCK',
            hashSecret: process.env.VNPAY_HASH_SECRET || 'VNPAY_SECRET',
            url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
        };
    }

    /**
     * Create MoMo Payment URL (Mock)
     */
    async createMomoPayment(order, req) {
        const orderId = order._id.toString();
        const requestId = orderId + '_' + Date.now();
        const amount = order.totalAmount;
        const orderInfo = `Thanh toán đơn hàng #${orderId} tại Đăng Khoa Sport`;
        const redirectUrl = `${req.protocol}://${req.get('host')}/checkout/payment/momo/callback`;
        const ipnUrl = `${req.protocol}://${req.get('host')}/api/payment/momo/webhook`;
        const extraData = '';

        const rawSignature = `accessKey=${this.momoConfig.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.momoConfig.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;

        const signature = crypto
            .createHmac('sha256', this.momoConfig.secretKey)
            .update(rawSignature)
            .digest('hex');

        // In a real app, you would POST to MoMo endpoint here.
        // For this demo, we return a mock success response with a redirect URL.
        return {
            payUrl: `https://test-payment.momo.vn/mock-gateway?requestId=${requestId}&orderId=${orderId}&signature=${signature}`,
            orderId,
            requestId
        };
    }

    /**
     * Create VNPay Payment URL (Standard Flow)
     */
    createVNPayPayment(order, req) {
        let date = new Date();
        let createDate = date.getFullYear() +
            ('0' + (date.getMonth() + 1)).slice(-2) +
            ('0' + date.getDate()).slice(-2) +
            ('0' + date.getHours()).slice(-2) +
            ('0' + date.getMinutes()).slice(-2) +
            ('0' + date.getSeconds()).slice(-2);

        let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        let tmnCode = this.vnpayConfig.tmnCode;
        let secretKey = this.vnpayConfig.hashSecret;
        let vnpUrl = this.vnpayConfig.url;
        let returnUrl = `${req.protocol}://${req.get('host')}/checkout/payment/vnpay/callback`;

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = order._id.toString();
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang #' + order._id;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = order.totalAmount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        vnp_Params = this.sortObject(vnp_Params);

        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac('sha512', secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;

        return vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });
    }

    /**
     * Utilities
     */
    sortObject(obj) {
        let sorted = {};
        let str = [];
        let key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
        }
        return sorted;
    }
}

module.exports = new PaymentService();
