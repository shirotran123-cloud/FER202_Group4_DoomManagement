import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Custom Route for Auto-Approval Engine
server.post('/api/bookings/approve', (req, res) => {
  const { bookingId } = req.body;
  const db = router.db; // lowdb instance

  const booking = db.get('bookings').find({ id: bookingId }).value();
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  const user = db.get('users').find({ id: booking.userId }).value();
  const bed = db.get('beds').find({ id: booking.bedId }).value();

  if (!user || !bed) {
    return res.status(400).json({ success: false, message: 'Invalid User or Bed' });
  }

  const compartment = db.get('compartments').find({ id: bed.compartmentId }).value();
  const room = db.get('rooms').find({ id: compartment.roomId }).value();
  const floor = db.get('floors').find({ id: room.floorId }).value();
  const building = db.get('buildings').find({ id: floor.buildingId }).value();

  // Condition 1: Gender match
  if (user.gender !== building.genderType) {
    return res.status(400).json({ 
      success: false, 
      message: `Gender mismatch. Student is ${user.gender}, Building is ${building.genderType}` 
    });
  }

  // Condition 2: No previous debt and not suspended
  if (user.previousDebt > 0 || user.isSuspended) {
    return res.status(400).json({
      success: false,
      message: 'Student has previous debt or is currently suspended.'
    });
  }

  // Condition 3: Payment status
  if (booking.status !== 'PAID') {
    return res.status(400).json({
      success: false,
      message: 'Deposit must be 100% PAID to approve.'
    });
  }

  // Auto-Approve logic executed successfully:
  // Update booking
  db.get('bookings')
    .find({ id: bookingId })
    .assign({ status: 'APPROVED' })
    .write();

  // Update bed
  db.get('beds')
    .find({ id: booking.bedId })
    .assign({ status: 'OCCUPIED', studentId: user.id })
    .write();

  // Create contract
  const contractId = `ct_${Date.now()}`;
  const contract = {
    id: contractId,
    bookingId,
    userId: user.id,
    bedCode: bed.fullCode,
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  };
  
  db.get('contracts').push(contract).write();

  return res.json({
    success: true,
    message: 'Auto-Approval successful',
    data: {
      booking: db.get('bookings').find({ id: bookingId }).value(),
      contract
    }
  });
});

// Use default router for everything else
server.use('/api', router);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`JSON Server with Auto-Approval Engine is running on port ${PORT}`);
});
