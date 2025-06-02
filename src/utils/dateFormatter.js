export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date.toLocaleString() : 'Invalid Date';
  };