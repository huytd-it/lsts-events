import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Row, Col, Typography, Divider } from 'antd';
import { CalendarOutlined, FolderOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Home = () => {
  return (
    <div className="public-home">
      {/* Hero Section */}
      <div className="hero-section" style={{ 
        background: 'linear-gradient(135deg, #9eefe1 0%, #1b4664 100%)', 
        padding: '80px 20px', 
        textAlign: 'center',
        color: 'white'
      }}>
        <Title level={1} style={{ color: 'white', marginBottom: '20px' }}>
          Lawrence S.Ting School Events
        </Title>
        <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 30px' }}>
          Discover and explore events from Lawrence S.Ting School. Browse by year, category, or search for specific events.
        </Paragraph>
        <Link to="/events">
          <Button type="primary" size="large" style={{ 
            backgroundColor: '#1b4664', 
            borderColor: '#1b4664',
            fontSize: '16px',
            padding: '0 30px',
            height: '45px'
          }}>
            Browse Events
          </Button>
        </Link>
      </div>

      {/* Features Section */}
      <div className="features-section" style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '50px' }}>
          Explore Events
        </Title>
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} md={8}>
            <Card 
              hoverable 
              style={{ borderRadius: '10px', textAlign: 'center' }}
              bodyStyle={{ padding: '30px' }}
            >
              <CalendarOutlined style={{ fontSize: '48px', color: '#9eefe1', marginBottom: '20px' }} />
              <Title level={4}>By Year</Title>
              <Paragraph>
                Browse events organized by year. See how our school events have evolved over time.
              </Paragraph>
              <Link to="/events/years">
                <Button type="primary">View Timeline</Button>
              </Link>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              hoverable 
              style={{ borderRadius: '10px', textAlign: 'center' }}
              bodyStyle={{ padding: '30px' }}
            >
              <FolderOutlined style={{ fontSize: '48px', color: '#9eefe1', marginBottom: '20px' }} />
              <Title level={4}>By Category</Title>
              <Paragraph>
                Explore events by category. Find all the events that match your interests.
              </Paragraph>
              <Link to="/events/categories">
                <Button type="primary">Browse Categories</Button>
              </Link>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              hoverable 
              style={{ borderRadius: '10px', textAlign: 'center' }}
              bodyStyle={{ padding: '30px' }}
            >
              <UserOutlined style={{ fontSize: '48px', color: '#9eefe1', marginBottom: '20px' }} />
              <Title level={4}>Search</Title>
              <Paragraph>
                Search for specific events by name, date, or description.
              </Paragraph>
              <Link to="/events/search">
                <Button type="primary">Search Events</Button>
              </Link>
            </Card>
          </Col>
        </Row>
      </div>

      {/* About Section */}
      <div className="about-section" style={{ 
        background: '#f8f9fa', 
        padding: '60px 20px', 
        textAlign: 'center',
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        <Title level={2} style={{ marginBottom: '30px' }}>
          About Our Events
        </Title>
        <Paragraph style={{ fontSize: '16px', maxWidth: '800px', margin: '0 auto 30px' }}>
          Lawrence S.Ting School hosts a variety of events throughout the year, including academic conferences, cultural festivals, sports competitions, and community gatherings. Our events bring together students, faculty, parents, and the wider community to celebrate learning, creativity, and collaboration.
        </Paragraph>
        <Divider />
        <div style={{ marginTop: '30px' }}>
          <Title level={4}>Featured Event Categories</Title>
          <div style={{ marginTop: '20px' }}>
            <Link to="/events/categories/1">
              <Button style={{ margin: '5px' }}>Academic Conferences</Button>
            </Link>
            <Link to="/events/categories/2">
              <Button style={{ margin: '5px' }}>Cultural Festivals</Button>
            </Link>
            <Link to="/events/categories/3">
              <Button style={{ margin: '5px' }}>Sports Events</Button>
            </Link>
            <Link to="/events/categories/4">
              <Button style={{ margin: '5px' }}>Community Gatherings</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;