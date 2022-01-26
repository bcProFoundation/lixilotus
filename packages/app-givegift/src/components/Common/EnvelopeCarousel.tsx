import { Envelope } from '@abcpros/givegift-models';
import { Carousel, Slider } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

export interface EnvelopeCarouselPros {
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
};

const EnvelopeCarousel = (props: EnvelopeCarouselPros) => {
  const { envelopes, handleChangeEnvelope } = props;
  const baseUrl = process.env.REACT_APP_LIXI_API;
  const [selectEnvelopeId, setSelectEnvelopeId] = useState(0);

  const onCarouselItemClick = (item: Envelope) => {
    setSelectEnvelopeId(item.id);
    handleChangeEnvelope(item.id);
  };

  return (
    <>
      <Carousel {...carouselSettings}>
        {envelopes &&
          envelopes.length > 0 &&
          envelopes.map((item) => {
            const isActive = item.id === selectEnvelopeId;

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
                    boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px'
                  }}
                  src={baseUrl + item.image}
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
