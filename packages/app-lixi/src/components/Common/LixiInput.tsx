import { Input } from 'antd';
import React from 'react';
import styled from 'styled-components';

type LixiInputProps = {
  size?: string;
  type?: string;
  value?: any;
  placeHolder?: string;
  readOnly?: boolean;
  required?: boolean;
  disabled?: boolean;
  labelName?: string;
  hintTextStart?: string;
  hintTextEnd?: string;
  prefixIcon?: any;
  subfixIcon?: any;
  stateInput?: {
    isError?: boolean;
    isWarning?: boolean;
    isSuccess?: boolean;
    isDisabled?: boolean;
  };
  onChange?: (element: any) => void;
  onBlur?: (element: any) => void;
};

const LixiInput = (lixiInputProps?: LixiInputProps) => {
  const { onChange, onBlur } = lixiInputProps;

  const LixiInputContainer = styled.div`
    text-align: left;
    width: 100%;
    .label-name {
      h5 {
        margin-bottom: 4px;
        letter-spacing: 0.4px;
        font-size: 12px;
        line-height: 16px;
        font-weight: 400;
        color: #4e444b;
      }
    }
    .ant-input {
      padding: 9px 1rem;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      letter-spacing: 0.5px;
      color: #4e444b;
      background: #fff;
      border: 2px solid var(--border-color-base);
      border-radius: 8px;
      &:hover {
        background: #fff;
        border: 2px solid var(--color-primary);
        box-shadow: 0px 0px 4px rgba(148, 31, 147, 0.5);
      }
      &:focus {
        background: #fff;
        border: 2px solid var(--color-primary);
        box-shadow: 0px 0px 4px rgba(148, 31, 147, 0.5);
      }
    }
    .ant-input-affix-wrapper {
      background: #fff;
      padding: 9px 1rem;
      border: 2px solid var(--border-color-base);
      border-radius: 8px;
      .ant-input {
        border-radius: 0;
        background: transparent;
        padding: 0;
        border: 0;
        &:hover {
          border: 0;
          box-shadow: none;
        }
        &:focus {
          border: 0;
          box-shadow: none;
        }
      }
      &:hover {
        background: #fff;
        border: 2px solid var(--color-primary);
        box-shadow: 0px 0px 4px rgba(148, 31, 147, 0.5);
      }
      &:focus {
        background: #fff;
        border: 2px solid var(--color-primary);
        box-shadow: 0px 0px 4px rgba(148, 31, 147, 0.5);
      }
    }
    .hint {
      justify-content: space-between;
      margin: 0 1rem;
      span {
        margin-top: 4px;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.4px;
        color: #4e444b;
      }
    }
    &.error-input {
      .label-name {
        h5 {
          color: var(--color-danger);
        }
      }
      .hint {
        span {
          color: var(--color-danger);
        }
      }
      .ant-input {
        border: 2px solid var(--color-danger);
        &:hover {
          background: #fff;
          border: 2px solid var(--color-danger);
          box-shadow: 0px 0px 4px rgba(186, 26, 26, 0.5);
        }
        &:focus {
          background: #fff;
          border: 2px solid var(--color-danger);
          box-shadow: 0px 0px 4px rgba(186, 26, 26, 0.5);
        }
      }
      .ant-input-affix-wrapper {
        background: #fff;
        padding: 9px 1rem;
        border: 2px solid var(--color-danger);
        border-radius: 8px;
        .ant-input {
          border-radius: 0;
          background: transparent;
          padding: 0;
          border: 0;
          &:hover {
            border: 0;
            box-shadow: none;
          }
          &:focus {
            border: 0;
            box-shadow: none;
          }
        }
        &:hover {
          background: #fff;
          border: 2px solid var(--color-danger);
          box-shadow: 0px 0px 4px rgba(186, 26, 26, 0.5);
        }
        &:focus {
          background: #fff;
          border: 2px solid var(--color-danger);
          box-shadow: 0px 0px 4px rgba(186, 26, 26, 0.5);
        }
      }
    }
    &.warning-input {
      .label-name {
        h5 {
          color: var(--color-warning);
        }
      }
      .hint {
        span {
          color: var(--color-warning);
        }
      }
      .ant-input {
        border: 2px solid var(--color-warning);
        &:hover {
          background: #fff;
          border: 2px solid var(--color-warning);
          box-shadow: 0px 0px 4px rgba(186, 26, 26, 0.5);
        }
        &:focus {
          background: #fff;
          border: 2px solid var(--color-warning);
          box-shadow: 0px 0px 4px rgba(186, 26, 26, 0.5);
        }
      }
      .ant-input-affix-wrapper {
        background: #fff;
        padding: 9px 1rem;
        border: 2px solid var(--color-warning);
        border-radius: 8px;
        .ant-input {
          border-radius: 0;
          background: transparent;
          padding: 0;
          border: 0;
          &:hover {
            border: 0;
            box-shadow: none;
          }
          &:focus {
            border: 0;
            box-shadow: none;
          }
        }
        &:hover {
          background: #fff;
          border: 2px solid var(--color-warning);
          box-shadow: 0px 0px 4px rgba(186, 26, 26, 0.5);
        }
        &:focus {
          background: #fff;
          border: 2px solid var(--color-warning);
          box-shadow: 0px 0px 4px rgba(186, 26, 26, 0.5);
        }
      }
    }
    &.success-input {
      .label-name {
        h5 {
          color: var(--color-success);
        }
      }
      .hint {
        span {
          color: var(--color-success);
        }
      }
      .ant-input {
        border: 2px solid var(--color-success);
        &:hover {
          background: #fff;
          border: 2px solid var(--color-success);
          box-shadow: 0px 0px 4px rgba(186, 26, 26, 0.5);
        }
        &:focus {
          background: #fff;
          border: 2px solid var(--color-success);
          box-shadow: 0px 0px 4px rgba(186, 26, 26, 0.5);
        }
      }
      .ant-input-affix-wrapper {
        background: #fff;
        padding: 9px 1rem;
        border: 2px solid var(--color-success);
        border-radius: 8px;
        .ant-input {
          border-radius: 0;
          background: transparent;
          padding: 0;
          border: 0;
          &:hover {
            border: 0;
            box-shadow: none;
          }
          &:focus {
            border: 0;
            box-shadow: none;
          }
        }
        &:hover {
          background: #fff;
          border: 2px solid var(--color-success);
          box-shadow: 0px 0px 4px rgba(186, 26, 26, 0.5);
        }
        &:focus {
          background: #fff;
          border: 2px solid var(--color-success);
          box-shadow: 0px 0px 4px rgba(186, 26, 26, 0.5);
        }
      }
    }
    &.disabled-input {
      cursor: no-drop;
      .label-name {
        h5 {
          color: rgba(78, 68, 75, 0.38);
        }
      }
      .hint {
        span {
          color: rgba(78, 68, 75, 0.38);
        }
      }
      .ant-input {
        border: 1px solid rgba(78, 68, 75, 0.38);
        &:hover {
          background: #fff;
          border: 1px solid rgba(78, 68, 75, 0.38);
          box-shadow: none;
        }
      }
      .ant-input-affix-wrapper {
        padding: 9px 1rem;
        border: 2px solid rgba(78, 68, 75, 0.38);
        border-radius: 8px;
        background: #fff;
        .ant-input {
          border-radius: 0;
          background: transparent;
          padding: 0;
          border: 0;
          &:hover {
            border: 0;
            box-shadow: none;
          }
          &:focus {
            border: 0;
            box-shadow: none;
          }
        }
        &:hover {
          background: #fff;
          border: 2px solid rgba(78, 68, 75, 0.38);
          box-shadow: none;
        }
      }
    }
    .ant-input-prefix {
      margin-right: 1rem;
    }
    .ant-input-suffix {
      margin-left: 1rem;
    }
    &.large {
      .ant-input {
        padding: 1rem;
      }
      .ant-input-affix-wrapper {
        padding: 1rem;
        .ant-input {
          padding: 0;
        }
      }
    }
    &.small {
      .ant-input {
        padding: 4px 1rem;
        font-size: 14px;
      }
      .ant-input-affix-wrapper {
        padding: 4px 1rem;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        .ant-input {
          padding: 0;
        }
      }
    }
  `;

  const classNameState = () => {
    let classNameState = '';
    if (lixiInputProps?.stateInput?.isDisabled) {
      classNameState = 'disabled-input';
    } else if (lixiInputProps?.stateInput?.isError) {
      classNameState = 'error-input';
    } else if (lixiInputProps?.stateInput?.isSuccess) {
      classNameState = 'success-input';
    } else if (lixiInputProps?.stateInput?.isWarning) {
      classNameState = 'warning-input';
    }
    return classNameState + ` ${lixiInputProps.size}`;
  };

  return (
    <>
      <LixiInputContainer className={classNameState()}>
        <div className="label-name">
          <h5>{lixiInputProps?.labelName}</h5>
        </div>
        <Input
          placeholder={lixiInputProps?.placeHolder}
          readOnly={lixiInputProps?.readOnly}
          required={lixiInputProps?.required}
          disabled={lixiInputProps?.disabled || lixiInputProps?.stateInput?.isDisabled}
          prefix={lixiInputProps?.prefixIcon}
          suffix={lixiInputProps?.subfixIcon}
          type={lixiInputProps?.type}
          value={lixiInputProps?.value}
          onChange={onChange}
          onBlur={onBlur}
        />
        <div
          style={{ display: lixiInputProps?.hintTextStart || lixiInputProps?.hintTextEnd ? 'flex' : 'none' }}
          className="hint"
        >
          <span>{lixiInputProps?.hintTextStart}</span>
          <span>{lixiInputProps?.hintTextEnd}</span>
        </div>
      </LixiInputContainer>
    </>
  );
};

export default LixiInput;
