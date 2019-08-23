import { Logger } from '@nestjs/common';
import { expect } from 'chai';
import { join } from 'path';
import { Observable } from 'rxjs';
import * as sinon from 'sinon';
import { ClientKafka } from '../../client';
import { SinonStub } from 'sinon';

describe('ClientKafka', () => {
  let client: ClientKafka;
  let callback: sinon.SinonSpy;
  let connect: sinon.SinonSpy;
  let subscribe: sinon.SinonSpy;
  let run: sinon.SinonSpy;
  let on: sinon.SinonSpy;
  let send: sinon.SinonSpy;
  let consumerStub: SinonStub;
  let producerStub: SinonStub;
  beforeEach(() => {
    client = new ClientKafka({});
    connect = sinon.spy();
    subscribe = sinon.spy();
    run = sinon.spy();
    on = sinon.spy();
    send = sinon.spy();

    consumerStub = sinon.stub(client, 'consumer')
      .callsFake(() => {
        return {
          connect,
          subscribe,
          run,
          on,
          events: {
            GROUP_JOIN: 'group.join'
          }
        };
      });
    producerStub = sinon.stub(client, 'producer')
      .callsFake(() => {
        return {
          connect,
          send
        };
      });
    sinon.stub(client, 'createClient').callsFake(() => {
      return {
        consumer: consumerStub,
        producer: producerStub,
      };
    });
  });

  it('connect', async () => {
    const bindTopics = sinon.spy();
    client.bindTopics = bindTopics;
    await client.connect();
    expect(connect.called).to.be.true;
    expect(on.called).to.be.true;
    expect(bindTopics.called).to.be.true;
  });
  it('close', async () => {
    await client.close();
    expect(client.producer).to.be.null;
    expect(client.consumer).to.be.null;
  });
});
