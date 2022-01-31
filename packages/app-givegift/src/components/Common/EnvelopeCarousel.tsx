import { Envelope } from '@abcpros/givegift-models';
import { Carousel, Slider } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

const baseUrl = process.env.REACT_APP_LIXI_API;

export interface EnvelopeCarouselPros {
  className?: string;
  envelopes: Envelope[];
  handleChangeEnvelope: Function;
}

const carouselSettings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  swipeToSlide: true,
  draggable: true,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1
      },
    },
  ],
};

const EnvelopeCarousel = (props: EnvelopeCarouselPros) => {
  const { className, envelopes, handleChangeEnvelope } = props;
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState(0);

  const onCarouselItemClick = (item: Envelope) => {
    if (item.id === selectedEnvelopeId) {
      setSelectedEnvelopeId(0);
      handleChangeEnvelope(0);
    } else {
      setSelectedEnvelopeId(item.id);
      handleChangeEnvelope(item.id);
    }
  };

  return (
    <>
      <Carousel {...carouselSettings} className={className}>
        {envelopes &&
          envelopes.length > 0 &&
          envelopes.map((item) => {
            const isActive = item.id === selectedEnvelopeId;

            return (
              <div>
                <img
                  style={{
                    height: '160px',
                    color: '#fff',
                    lineHeight: '160px',
                    textAlign: 'center',
                    border: isActive ? 'solid 2px #6f2dbd' : 'none',
                    padding: isActive ? '1px' : '0',
                    boxShadow: 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
                  }}
                  src={baseUrl + item.thumbnail}
                  onClick={() => onCarouselItemClick(item)}
                />
              </div>
            );
          })}
      </Carousel>
    </>
  );
};

export default EnvelopeCarousel;
