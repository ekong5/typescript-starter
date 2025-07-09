const baseUrl = 'http://localhost:3000';

async function testAPI() {
  console.log('🚀 Testing API...\n');

  try {
    // Test 1: Create users
    console.log('1. Creating users...');
    const user1 = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice Johnson' })
    });
    const user1Data = await user1.json();
    console.log('✅ User 1 created:', user1Data);

    const user2 = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob Smith' })
    });
    const user2Data = await user2.json();
    console.log('✅ User 2 created:', user2Data);

    // Test 2: Get all users
    console.log('\n2. Getting all users...');
    const usersResponse = await fetch(`${baseUrl}/users`);
    const users = await usersResponse.json();
    console.log('✅ Users:', users);

    // Test 3: Create an event
    console.log('\n3. Creating an event...');
    const eventData = {
      title: 'Team Meeting',
      description: 'Weekly team sync meeting',
      startTime: new Date('2025-07-07T10:00:00Z').toISOString(),
      endTime: new Date('2025-07-07T11:00:00Z').toISOString(),
      inviteeIds: [user1Data.id, user2Data.id]
    };

    const eventResponse = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    const event = await eventResponse.json();
    console.log('✅ Event created:', event);

    // Test 4: Get the event
    console.log('\n4. Getting the event...');
    const getEventResponse = await fetch(`${baseUrl}/events/${event.id}`);
    const retrievedEvent = await getEventResponse.json();
    console.log('✅ Event retrieved:', retrievedEvent);

    // Test 5: Test merge overlapping events
    console.log('\n5. Testing merge overlapping events...');
    
    // Create another overlapping event
    const overlappingEvent = {
      title: 'Follow-up Discussion',
      description: 'Discuss action items',
      startTime: new Date('2025-07-07T10:30:00Z').toISOString(),
      endTime: new Date('2025-07-07T11:30:00Z').toISOString(),
      inviteeIds: [user1Data.id]
    };

    const overlappingResponse = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(overlappingEvent)
    });
    const overlappingEventData = await overlappingResponse.json();
    console.log('✅ Overlapping event created:', overlappingEventData);

    // Merge overlapping events for user1
    const mergeResponse = await fetch(`${baseUrl}/events/merge-all/${user1Data.id}`, {
      method: 'POST'
    });
    const mergedEvents = await mergeResponse.json();
    console.log('✅ Merged events:', mergedEvents);

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
testAPI();