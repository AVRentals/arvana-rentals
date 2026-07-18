// Rental agreement template shown at checkout and e-signed by the renter.
// Adapted from Daniel's existing PRIVATE RENTAL CONTRACT.pdf — the original
// file has the WRONG business name on it ("TMC LUX MANAGEMENT / Trevor
// Calais", a different operator's template). This version substitutes
// "Arvana Rentals" as a placeholder. CONFIRM the real legal entity name
// (has the LLC actually been formed yet? see Setup Checklist) and a real
// contact email before this goes live — using the wrong business/contact
// info on a document renters legally sign is a real problem, not cosmetic.

export const CONTRACT_VERSION = 'v1-2026-07-18';

export const getContractText = (opts: {
  make: string; model: string; year: number; vin?: string; licensePlate?: string;
  renterName: string; startDate: string; endDate: string;
  insuranceCompany?: string; insurancePolicyNumber?: string;
}) => `ARVANA RENTALS — VEHICLE RENTAL AGREEMENT

Effective Date: ${new Date().toLocaleDateString()}

This Agreement is entered into between Arvana Rentals ("Owner") and the undersigned renter ("Renter").

1. Vehicle Information
Vehicle: ${opts.year} ${opts.make} ${opts.model}
VIN: ${opts.vin || '—'}
License Plate: ${opts.licensePlate || '—'}

2. Renter Information
Renter's Full Name: ${opts.renterName}
Renter's Insurance Company: ${opts.insuranceCompany || '—'}
Renter's Insurance Policy Number: ${opts.insurancePolicyNumber || '—'}
Rental Period: ${opts.startDate} to ${opts.endDate}

3. Rental Terms and Conditions
3.1 Insurance Responsibility: In the event of any incident, accident, or damage to the rented vehicle, it is the sole responsibility of the Renter to file a claim with their own insurance. Owner's insurance does not cover claims related to the rented vehicle while rented.
3.2 Fuel and Cleanliness: Renter agrees to return the vehicle with the same fuel level and in the same clean condition as received. Failure to do so may result in a $200 cleaning fee.
3.3 No Smoking Policy: Smoking of any kind (including marijuana and cigarettes) is strictly prohibited in the vehicle. A $300 fee applies if evidence of smoking is present.
3.4 Vehicle Damage: Renter is responsible for any damage to the vehicle incurred during the rental period, including tires and windshield.
3.5 Mileage Limit: The maximum daily mileage allowed is 200 miles unless otherwise agreed in writing in advance. Additional mileage charges may apply beyond this.
3.6 Legal Actions: Violation of this Agreement may result in legal action against the Renter.
3.7 Pre/Post-Trip Photos: Renter is required to provide photos of the vehicle's condition before and after the rental period. Failure to do so may result in the Renter being held liable for damages/incidents that cannot otherwise be documented.
3.8 Security Deposit: A refundable security deposit hold is placed on Renter's card at booking and released after the vehicle is returned in the agreed condition, less any charges under this Agreement.

4. General Provisions
4.1 This Agreement cannot be voided once signed by the Renter.

5. Signature
By typing their full name and submitting this booking request, the Renter acknowledges they have read, understood, and agree to the terms of this Agreement.`;
