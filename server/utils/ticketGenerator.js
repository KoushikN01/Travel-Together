const PDFDocument = require("pdfkit")
const fs = require("fs")
const path = require("path")
const nodemailer = require("nodemailer")
const QRCode = require("qrcode")

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Function to generate PDF ticket with reduced pricing
const generateTicketPDF = async (tripData) => {
  return new Promise(async (resolve, reject) => {
        try {
            console.log('=== PDF GENERATION START ===');
            console.log('Trip data received:', tripData);
            
            const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      })

      // Create a unique filename
      const filename = `ticket_${tripData._id}_${Date.now()}.pdf`
      const ticketsDir = path.join(__dirname, "../uploads/tickets")

      console.log('Tickets directory:', ticketsDir);
      console.log('Filename:', filename);

      // Ensure the directory exists
      if (!fs.existsSync(ticketsDir)) {
        console.log('Creating tickets directory...');
        fs.mkdirSync(ticketsDir, { recursive: true })
      }

      const filepath = path.join(ticketsDir, filename)
      console.log('Full filepath:', filepath);

      // Pipe the PDF to a file
      const stream = fs.createWriteStream(filepath)
      doc.pipe(stream)

      // Add header with company branding
      doc.fontSize(28).fillColor("#2196F3").text("TravelApp", { align: "center" })

      doc.fontSize(18).fillColor("#666").text("Travel Confirmation Ticket", { align: "center" })

      doc.moveDown(2)

      // Add a decorative line
      doc.strokeColor("#2196F3").lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke()

      doc.moveDown()

      // Add trip details in a structured format
      doc.fontSize(14).fillColor("#333")

      const leftColumn = 70
      const rightColumn = 300
      let currentY = doc.y

      // Booking details
      doc.text("BOOKING DETAILS", leftColumn, currentY, { underline: true, width: 200 })
      currentY += 25

      doc.text("Booking ID:", leftColumn, currentY)
      doc.text(tripData._id.toString().substring(0, 12).toUpperCase(), rightColumn, currentY)
      currentY += 20

      doc.text("Passenger Name:", leftColumn, currentY)
      doc.text(tripData.userName, rightColumn, currentY)
      currentY += 20

      doc.text("Email:", leftColumn, currentY)
      doc.text(tripData.userEmail, rightColumn, currentY)
      currentY += 30

      // Trip details
      doc.text("TRIP DETAILS", leftColumn, currentY, { underline: true, width: 200 })
      currentY += 25

      doc.text("Destination:", leftColumn, currentY)
      doc.text(tripData.destination, rightColumn, currentY)
      currentY += 20

      doc.text("Travel Date:", leftColumn, currentY)
      doc.text(
        new Date(tripData.date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        rightColumn,
        currentY,
      )
      currentY += 20

      doc.text("Departure Time:", leftColumn, currentY)
      doc.text(tripData.time, rightColumn, currentY)
      currentY += 30

      // Payment details
      doc.text("PAYMENT DETAILS", leftColumn, currentY, { underline: true, width: 200 })
      currentY += 25
      if (tripData.payment) {
        doc.fontSize(12).fillColor("#333").text("Amount:", leftColumn, currentY)
        doc.text(`₹${Number.parseFloat(tripData.payment.amount).toFixed(2)}`, rightColumn, currentY)
        currentY += 18
        doc.text("Method:", leftColumn, currentY)
        doc.text(tripData.payment.method, rightColumn, currentY)
        currentY += 18
        doc.text("Status:", leftColumn, currentY)
        doc.text(tripData.payment.status, rightColumn, currentY)
        currentY += 18
        doc.text("Payment ID:", leftColumn, currentY)
        doc.text(tripData.payment.id.toString(), rightColumn, currentY)
        currentY += 30
      }

      // Cost details with breakdown
      doc.fontSize(14).fillColor("#333").text("COST BREAKDOWN", leftColumn, currentY, { underline: true, width: 200 })
      currentY += 25

      // Base price (actual payment amount)
      const basePrice = tripData.payment ? Number.parseFloat(tripData.payment.amount) : Number.parseFloat(tripData.cost)
      const taxesAndFees = 0 // You can update this if you have tax/fee logic
      const totalPaid = basePrice + taxesAndFees

      doc.fontSize(12).fillColor("#333").text("Base Price:", leftColumn, currentY)
      doc.text(`₹${basePrice.toFixed(2)}`, rightColumn, currentY)
      currentY += 18

      doc.text("Taxes & Fees:", leftColumn, currentY)
      doc.text(`₹${taxesAndFees.toFixed(2)}`, rightColumn, currentY)
      currentY += 18

      doc.fontSize(16).fillColor("#27ae60").text("Total Amount Paid:", leftColumn, currentY, { width: 200 })
      doc.text(`₹${totalPaid.toFixed(2)}`, rightColumn, currentY)
      currentY += 40

      // Add QR code for digital verification
      doc.fontSize(12).fillColor("#666").text("Scan QR Code for Digital Verification:", leftColumn, currentY)

      // Generate QR code as a data URL
      const qrPayload = {
        tripId: tripData._id,
        paymentId: tripData.payment ? tripData.payment.id : undefined,
        userEmail: tripData.userEmail
      }
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload))
      // Draw QR code image
      doc.image(qrDataUrl, rightColumn, currentY - 5, { width: 60, height: 60 })
      currentY += 80

      // Add terms and conditions
      doc.fontSize(10).fillColor("#666").text("TERMS AND CONDITIONS:", leftColumn, currentY, { underline: true })
      currentY += 15

      const terms = [
        "• This ticket is non-transferable and must be presented at check-in",
        "• Please arrive 30 minutes before departure time",
        "• Valid government-issued photo ID required for travel",
        "• Cancellation policy applies as per booking terms",
        "• For support, contact us at support@travelapp.com",
      ]

      terms.forEach((term) => {
        doc.text(term, leftColumn, currentY, { width: 450 })
        currentY += 12
      })

      // Add footer
      currentY += 20
      doc.fontSize(8).fillColor("#999").text(`Generated on ${new Date().toLocaleString()}`, leftColumn, currentY)

      doc.text("Thank you for choosing TravelApp!", { align: "center" })

            // Finalize the PDF
      doc.end()

      stream.on("finish", () => {
        console.log('PDF file written successfully to:', filepath);
        resolve(filepath)
      })

      stream.on("error", (error) => {
        console.error('Stream error:', error);
        reject(error)
      })
        } catch (error) {
      console.error('PDF generation error:', error);
      reject(error)
    }
  })
        }

// Function to send confirmation email with ticket
const sendConfirmationEmail = async (userEmail, tripData, ticketPath) => {
    try {
    const originalCost = (Number.parseFloat(tripData.cost) / 0.3).toFixed(2)
    const savings = (originalCost - tripData.cost).toFixed(2)

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
      subject: "🎉 Your Travel Booking Confirmed - Amazing 70% Discount Applied!",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background: linear-gradient(135deg, #2196F3, #21CBF3); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
                        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">You saved ₹${savings} with our special discount!</p>
                    </div>
                    
                    <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-top: 0;">Dear ${tripData.userName},</h2>
                        <p style="color: #666; line-height: 1.6;">Thank you for booking with TravelApp! We're excited to confirm your travel reservation.</p>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #2196F3; margin-top: 0;">Trip Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Booking ID:</td>
                                    <td style="padding: 8px 0; color: #333;">${tripData._id.toString().substring(0, 12).toUpperCase()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Destination:</td>
                                    <td style="padding: 8px 0; color: #333;">${tripData.destination}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Travel Date:</td>
                                    <td style="padding: 8px 0; color: #333;">${new Date(
                                      tripData.date,
                                    ).toLocaleDateString("en-US", {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Departure Time:</td>
                                    <td style="padding: 8px 0; color: #333;">${tripData.time}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #e8f5e8, #f0f8f0); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
                            <h3 style="color: #27ae60; margin-top: 0;">💰 Cost Breakdown</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 5px 0; color: #666; text-decoration: line-through;">Original Price:</td>
                                    <td style="padding: 5px 0; color: #666; text-decoration: line-through; text-align: right;">₹${originalCost}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0; color: #e74c3c; font-weight: bold;">Special Discount (70% OFF):</td>
                                    <td style="padding: 5px 0; color: #e74c3c; font-weight: bold; text-align: right;">-₹${savings}</td>
                                </tr>
                                <tr style="border-top: 2px solid #27ae60;">
                                    <td style="padding: 10px 0; color: #27ae60; font-weight: bold; font-size: 18px;">Total Paid:</td>
                                    <td style="padding: 10px 0; color: #27ae60; font-weight: bold; font-size: 18px; text-align: right;">₹${Number.parseFloat(tripData.cost).toFixed(2)}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                            <h4 style="color: #856404; margin-top: 0;">📋 Important Reminders:</h4>
                            <ul style="color: #856404; margin: 0; padding-left: 20px;">
                                <li>Please arrive 30 minutes before departure</li>
                                <li>Bring a valid government-issued photo ID</li>
                                <li>Your ticket is attached to this email</li>
                                <li>This booking is non-transferable</li>
                </ul>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6;">Your detailed ticket is attached to this email. Please print it or save it on your mobile device for easy access during your trip.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <p style="color: #666; margin: 0;">Need help? Contact our support team:</p>
                            <p style="color: #2196F3; margin: 5px 0; font-weight: bold;">support@travelapp.com | 1-800-TRAVEL</p>
                        </div>
                        
                        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                            <h3 style="color: #2196F3; margin: 0;">Have an amazing trip! ✈️</h3>
                            <p style="color: #666; margin: 10px 0 0 0;">Thank you for choosing TravelApp</p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                        <p>This email was sent to ${userEmail}</p>
                        <p>© 2024 TravelApp. All rights reserved.</p>
                    </div>
                </div>
            `,
      attachments: [
        {
          filename: "travel-ticket.pdf",
          path: ticketPath,
        },
      ],
    }

    await transporter.sendMail(mailOptions)
    console.log("Confirmation email sent successfully")
    return true
  } catch (error) {
    console.error("Error sending confirmation email:", error)
    throw error
  }
}

module.exports = {
    generateTicketPDF,
  sendConfirmationEmail,
} 