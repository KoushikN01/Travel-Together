class Trip {
  constructor(data) {
    this._id = data._id;
    this.destinations = data.destinations || [];
    this.travelStyle = data.travelStyle;
    this.preferences = data.preferences || {};
    this.activities = data.activities || [];
  }

  static async findById(id) {
    // This would typically make an API call to fetch the trip
    // For now, we'll return a mock trip
    return new Trip({
      _id: id,
      destinations: ['New York'],
      travelStyle: 'luxury',
      preferences: {
        activities: ['sightseeing', 'dining'],
        budget: 'high'
      }
    });
  }

  hasAccess(userId) {
    // This would typically check if the user has access to this trip
    // For now, we'll return true
    return true;
  }
}

export default Trip; 