const db = new Dexie('twittor-pwa');

db.version(1).stores({
  messages: '++id, message',
});

async function saveMessage( message ) {
  await db.messages.add( message );
  self?.registration?.sync?.register('new-message');

  const newPost = {
    ok: true,
    offline: true,
  };

  return new Response( JSON.stringify(newPost) );
}

async function postMessages() {
  const messages = await db.messages.toArray();

  for await (let message of messages) {
    try {
      await fetch('api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify( message ),
      });
      await db.messages.delete( message.id );
    } catch (error) {
      console.log('Error in postMessages', error);
    }
  }
}