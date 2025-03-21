import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Grid,
} from '@mui/material';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import SpringBootServer from './Server';
import './BuntingCalendar.css';

const localizer = momentLocalizer(moment);

const darkShades = [
  "#0D47A1", "#1565C0", "#1976D2", "#1E88E5", "#2196F3",
  "#42A5F5", "#64B5F6", "#90CAF9", "#BBDEFB"
];

const BuntingCalendar = () => {
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [buttonsEnabled, setButtonsEnabled] = useState(false);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [hasFetchedEvents, setHasFetchedEvents] = useState(false); // Track if events have been fetched

  const fetchEvents = useCallback(async () => {
    try {
      const queryString = new URLSearchParams({
        lamppostNo: filterType === 'lamppostNo' ? filterValue : "",
        event: filterType === 'event' ? filterValue : "",
        startDate: moment(date).startOf('month').format('YYYY-MM-DD'),
        endDate: moment(date).endOf('month').format('YYYY-MM-DD'),
      }).toString();

      const url = `${SpringBootServer}/api/buntings/calendar?${queryString}`;

      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching events:', response.status, errorText);
        return;
      }

      const data = await response.json();
      console.log(queryString);
      console.log("Feched onject:");
      console.log(data);
      const transformedEvents = data.map((event, index) => ({
        ...event,
        title: `${event.Event} - ${event.Department} [${event['Installation Date']} - ${event['Removal Date']}]`,
        start: new Date(event['Installation Date']),
        end: new Date(event['Removal Date']),
        color: darkShades[index % darkShades.length], // Assigning dark shades
      }));

      setEvents(transformedEvents);
      setHasFetchedEvents(true); // Mark as fetched
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, [date, filterType, filterValue]);

  const handleSearchClick = () => {
    setButtonsEnabled(true);
    fetchEvents(); // Fetch events only when the search button is clicked
  };

  const handleNavigate = useCallback((action) => {
    let newDate;

    switch (action) {
      case 'PREV':
        if (view === Views.MONTH) {
          newDate = moment(date).subtract(1, 'month').toDate();
        } else if (view === Views.WEEK) {
          newDate = moment(date).subtract(1, 'week').toDate();
        } else if (view === Views.DAY) {
          newDate = moment(date).subtract(1, 'day').toDate();
        }
        break;
      case 'NEXT':
        if (view === Views.MONTH) {
          newDate = moment(date).add(1, 'month').toDate();
        } else if (view === Views.WEEK) {
          newDate = moment(date).add(1, 'week').toDate();
        } else if (view === Views.DAY) {
          newDate = moment(date).add(1, 'day').toDate();
        }
        break;
      case 'PREV_YEAR':
        newDate = moment(date).subtract(1, 'year').toDate();
        break;
      case 'NEXT_YEAR':
        newDate = moment(date).add(1, 'year').toDate();
        break;        
      case 'TODAY':
        newDate = new Date();
        break;
      default:
        newDate = date;
        break;
    }

    setDate(newDate);
  }, [date, view]);


  const handleViewChange = useCallback((view) => {
    setView(view);
  }, []);

  const CustomToolbar = ({ date, view, onView, onNavigate }) => {
    const monthYearFormat = "MMMM YYYY";
    const dayFormat = "dddd, MMMM D, YYYY";
    const monthYear = moment(date).format(monthYearFormat);
    const currentDay = moment(date).format(dayFormat);

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button onClick={() => onNavigate('PREV_YEAR')} >Previous Year</Button>
        <Button onClick={() => onNavigate('PREV')} >Previous</Button>
        <Button onClick={() => onNavigate('TODAY')} >Today</Button>
        <Button onClick={() => onNavigate('NEXT')} >Next</Button>
        <Button onClick={() => onNavigate('NEXT_YEAR')} >Next Year</Button>
        {view === Views.DAY ? (
          <Typography variant="h6">{currentDay}</Typography>
        ) : (
          <Typography variant="h6">{monthYear}</Typography>
        )}
        <div>
          <Button onClick={() => onView('month')} disabled={view === 'month'}>Month</Button>
          <Button onClick={() => onView('week')} disabled={view === 'week'}>Week</Button>
          <Button onClick={() => onView('day')} disabled={view === 'day'}>Day</Button>
          <Button onClick={() => onView('agenda')} disabled={view === 'agenda'}>Agenda</Button>
        </div>
      </div>
    );
  };

  const eventStyleGetter = (event) => {
    const backgroundColor = event.color;
    const style = {
      backgroundColor,
      borderRadius: '0px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
      fontSize: '0.7em', // Smaller font size for event text
    };
    return {
      style,
    };
  };



  useEffect(() => {
    fetchEvents();
  }, [date, view, fetchEvents]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Bunting Calendar</Typography>

      {/*<TextField
        select
        label="Select Filter"
        value={filterType}
        onChange={(e) => {
          setFilterType(e.target.value);
          setButtonsEnabled(false);
        }}
        style={{ marginRight: '16px', minWidth: '200px' }}
      >
        <MenuItem value="">None</MenuItem>
        <MenuItem value="lamppostNo">Lamppost No.</MenuItem>
        <MenuItem value="event">Event</MenuItem>
      </TextField>

      <TextField
        label="Filter Value"
        value={filterValue}
        onChange={(e) => {
          setFilterValue(e.target.value);
          setButtonsEnabled(false);
        }}
        style={{ marginRight: '16px' }}
      />

      <Button variant="contained" color="primary" onClick={handleSearchClick}>Search</Button> */}

      <div style={{ height: '600px', marginTop: '20px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          view={view}
          date={date}
          onView={(newView) => setView(newView)}
          onNavigate={handleNavigate}
          eventPropGetter={eventStyleGetter} // Custom event styling
          components={{
            toolbar: (props) => (
              <CustomToolbar
                {...props}
                onView={handleViewChange}
                view={view}
                onNavigate={handleNavigate}
              />
            ),
          }}
          onDrillDown={(date) => {
            setDate(date); // Set the date
            setView(Views.DAY); // Change to day view
          }}
        />
      </div>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Current Month Event Reference</Typography>
        <Grid container spacing={2}>
          {events.map((event, index) => (
            <Grid item xs={4} key={index}>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: event.color,
                    marginRight: 1,
                  }}
                />
                <Typography>{event.Event} - {event.Department}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default BuntingCalendar;
