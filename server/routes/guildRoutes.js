router.post('/join', authenticateToken, async (req, res) => {
  try {
    const { guildId, userAddress } = req.body;
    
    if (!guildId || !userAddress) {
      return res.status(400).json({ error: 'Guild ID and user address are required' });
    }

    // Check if guild exists
    const guild = await Guild.findOne({ id: guildId });
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    // Check if user exists and update their guild
    const user = await User.findOne({ walletAddress: userAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already in this guild
    if (user.guildId === guildId) {
      return res.status(400).json({ error: 'User is already in this guild' });
    }

    // Update user's guild
    user.guildId = guildId;
    await user.save();

    // Add user to guild members if not already there
    if (!guild.members.includes(user._id)) {
      guild.members.push(user._id);
      await guild.save();
    }

    res.json({ 
      message: 'Successfully joined guild', 
      guild: {
        id: guild.id,
        name: guild.name,
        description: guild.description,
        memberCount: guild.members.length
      }
    });
  } catch (error) {
    console.error('Error joining guild:', error);
    res.status(500).json({ error: 'Failed to join guild' });
  }
}); 