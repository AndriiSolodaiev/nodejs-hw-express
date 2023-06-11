const nodemailer = require("nodemailer");
require("dotenv").config();

const { UKR_NET_PASSWORD, UKR_NET_EMAIL } = process.env;

const nodemailerConfig = {
  host: "smtp.ukr.net",
  port: 2525,
  secure: true,
  auth: {
    user: UKR_NET_EMAIL,
    pass: UKR_NET_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = async (data) => {
  const email = { ...data, from: UKR_NET_EMAIL };
  console.log(transport);
  await transport.sendMail(email);
  return true;
};
// const Mailjet = require("node-mailjet");

// const { MJ_SECRET_KEY, MJ_API_KEY, MJ_SENDER_EMAIL } = process.env;

// const mailjet = new Mailjet({
//   apiKey: MJ_API_KEY,
//   apiSecret: MJ_SECRET_KEY,
// });

// const sendEmail = async (data) => {
//   await mailjet.post("send", { version: "v3.1" }).request({
//     Messages: [
//       {
//         From: {
//           Email: MJ_SENDER_EMAIL,
//           Name: "Andrii",
//         },
//         To: [
//           {
//             Email: data.to,
//             Name: "libavef111",
//           },
//         ],
//         Subject: data.subject,
//         // TextPart: data.subject,
//         HTMLPart: data.html,
//       },
//     ],
//   });
// };

module.exports = sendEmail;
