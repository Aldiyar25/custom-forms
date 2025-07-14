import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const loginBase =
  process.env.SF_AUTH_URL ||
  process.env.SF_LOGIN_URL ||
  "https://login.salesforce.com";
const SF_LOGIN_URL = loginBase.replace(/\/$/, "");
const SF_API_VERSION = process.env.SF_API_VERSION || "v59.0";

async function getToken() {
  const params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("client_id", process.env.SF_CLIENT_ID || "");
  params.append("client_secret", process.env.SF_CLIENT_SECRET || "");
  params.append("username", process.env.SF_USERNAME || "");
  params.append("password", process.env.SF_PASSWORD || "");

  const tokenEndpoint = SF_LOGIN_URL.includes("/services/oauth2/token")
    ? SF_LOGIN_URL
    : `${SF_LOGIN_URL}/services/oauth2/token`;
  const res = await fetch(tokenEndpoint, {
    method: "POST",
    body: params,
  });

  if (!res.ok) {
    throw new Error(`Salesforce auth failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export const pushToSalesforce = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (req.user.id !== id && req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied" });
  }
  const requiredVars = [
    "SF_CLIENT_ID",
    "SF_CLIENT_SECRET",
    "SF_USERNAME",
    "SF_PASSWORD",
    "SF_API_VERSION",
  ];
  const missingVars = requiredVars.filter((v) => !process.env[v]);
  if (!process.env.SF_AUTH_URL && !process.env.SF_LOGIN_URL) {
    missingVars.push("SF_AUTH_URL or SF_LOGIN_URL");
  }
  if (missingVars.length) {
    return res.status(500).json({
      message: `Salesforce missing env: ${missingVars.join(",")}`,
    });
  }
  try {
    const { companyName, phone, title } = req.body;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { username: true, email: true },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { access_token, instance_url } = await getToken();
    const headers = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };

    const accRes = await fetch(
      `${instance_url}/services/data/${SF_API_VERSION}/sobjects/Account`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ Name: companyName }),
      }
    );
    if (!accRes.ok) {
      const text = await accRes.text();
      console.error("Account error", text);
      if (text.includes("DUPLICATES_DETECTED")) {
        return res.json({ message: "Account already created" });
      }
      return res.status(500).json({
        message: text || "Error creating Account",
      });
    }
    const accData = await accRes.json();

    const contactPayload = {
      LastName: user.username || "User",
      Email: user.email,
      AccountId: accData.id,
      ...(title && { Title: title }),
      ...(phone && { Phone: phone }),
    };

    const ctRes = await fetch(
      `${instance_url}/services/data/${SF_API_VERSION}/sobjects/Contact`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(contactPayload),
      }
    );

    if (!ctRes.ok) {
      const text = await ctRes.text();
      console.error("Contact error", text);
      return res.status(500).json({
        message: text || "Error creating Contact",
      });
    }
    const ctData = await ctRes.json();

    res.json({ accountId: accData.id, contactId: ctData.id });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: err.message || "Salesforce integration error" });
  }
};
