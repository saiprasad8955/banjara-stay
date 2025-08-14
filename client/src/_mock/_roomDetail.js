// This function simulates fetching details for a specific room by its ID.
export function getMockRoomDetailsById(id) {
  const allDetails = {
    // SCENARIO 1: An occupied room with a current and past resident
    '65293e82c59a2f4705a5a102': {
      room: {
        _id: '65293e82c59a2f4705a5a102',
        number: '102',
        floor: 'First',
        type: 'Studio',
        rent: 6000,
        status: 'occupied',
      },
      families: [
        {
          _id: 'fam_current_789',
          roomId: '65293e82c59a2f4705a5a102',
          head: { name: 'Ravi Kumar', aadhar: '1234 5678 9012', mobile: '9876543210' },
          checkInDate: '2025-01-15T10:00:00Z',
          checkOutDate: null,
          isActive: true,
          members: [
            {
              name: 'rakhi sawant',
              aadhar: '73398478273947',
              mobile: '9812873123123',
              _id: 'temp_1755097078443',
            },
            {
              name: 'rakhi 2 sawant',
              aadhar: 'sad23123123213',
              mobile: 'q3213123123123',
              _id: 'temp_1755097091342',
            },
          ],
        },
        {
          _id: 'fam_past_123',
          roomId: '65293e82c59a2f4705a5a102',
          head: { name: 'Priya Sharma d1', aadhar: '9876 5432 1098', mobile: '8765432109' },
          checkInDate: '2024-03-01T12:00:00Z',
          checkOutDate: '2024-12-20T18:00:00Z',
          isActive: false,
          members: [
            {
              name: 'rakhi sawant',
              aadhar: '73398478273947',
              mobile: '9812873123123',
              _id: 'temp_1755097078443',
            },
            {
              name: 'rakhi 2 sawant',
              aadhar: 'sad23123123213',
              mobile: 'q3213123123123',
              _id: 'temp_1755097091342',
            },
          ],
        },
        {
          _id: 'fam_past_123',
          roomId: '65293e82c59a2f4705a5a102',
          head: { name: 'Priya Sharma d2', aadhar: '9876 5432 1098', mobile: '8765432109' },
          checkInDate: '2024-03-01T12:00:00Z',
          checkOutDate: '2024-12-20T18:00:00Z',
          isActive: false,
          members: [
            {
              name: 'rakhi sawant',
              aadhar: '73398478273947',
              mobile: '9812873123123',
              _id: 'temp_1755097078443',
            },
            {
              name: 'rakhi 2 sawant',
              aadhar: 'sad23123123213',
              mobile: 'q3213123123123',
              _id: 'temp_1755097091342',
            },
          ],
        },
        {
          _id: 'fam_past_123',
          roomId: '65293e82c59a2f4705a5a102',
          head: { name: 'Priya d3', aadhar: '9876 5432 1098', mobile: '8765432109' },
          checkInDate: '2024-03-01T12:00:00Z',
          checkOutDate: '2024-12-20T18:00:00Z',
          isActive: false,
          members: [
            {
              name: 'rakhi sawant',
              aadhar: '73398478273947',
              mobile: '9812873123123',
              _id: 'temp_1755097078443',
            },
            {
              name: 'rakhi 2 sawant',
              aadhar: 'sad23123123213',
              mobile: 'q3213123123123',
              _id: 'temp_1755097091342',
            },
          ],
        },
      ],
    },
    // SCENARIO 2: An available room with a past resident
    '65293e82c59a2f4705a5a101': {
      room: {
        _id: '65293e82c59a2f4705a5a101',
        number: '101',
        floor: 'First',
        type: '1BHK',
        rent: 8500,
        status: 'available',
      },
      families: [
        {
          _id: 'fam_past_456',
          roomId: '65293e82c59a2f4705a5a101',
          head: { name: 'Amit Singh', aadhar: '5678 9012 3456', mobile: '7654321098' },
          checkInDate: '2023-08-10T09:00:00Z',
          checkOutDate: '2025-07-31T17:00:00Z',
          isActive: false,
        },
      ],
    },
    // SCENARIO 3: A room under maintenance with no resident history shown
    '65293e82c59a2f4705a5a103': {
      room: {
        _id: '65293e82c59a2f4705a5a103',
        number: '205',
        floor: 'Second',
        type: '2BHK Deluxe',
        rent: 12000,
        status: 'maintenance',
      },
      families: [], // No residents while under maintenance
    },
  };

  // Return the details for the requested ID, or null if not found
  return allDetails[id] || null;
}
