import { Envelope } from '@bcpros/lixi-models';
import { Carousel, Slider } from 'antd';
import { useState } from 'react';

const baseUrl = process.env.NEXT_PUBLIC_LIXI_API;

export interface EnvelopeCarouselProps {
  className?: string;
  envelopes: Envelope[];
  handleChangeEnvelope: Function;
}

const carouselSettings = {
  dots: false,
  rows: 2,
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
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1
      }
    }
  ]
};

const EnvelopeCarousel = (props: EnvelopeCarouselProps) => {
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
          envelopes.map(item => {
            const isActive = item.id === selectedEnvelopeId;

            return (
              <div key={item.id}>
                <img
                  style={{
                    height: '160px',
                    color: '#fff',
                    lineHeight: '160px',
                    textAlign: 'center',
                    border: isActive ? 'solid 2px var(--color-primary)' : 'none',
                    padding: isActive ? '9px 7px' : '7px 5px'
                  }}
                  src={baseUrl + 'api/' + item.thumbnail}
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
